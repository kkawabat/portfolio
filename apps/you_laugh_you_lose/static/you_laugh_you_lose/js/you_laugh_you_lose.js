import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const FACE_MODEL =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const JAW_THRESHOLD = 0.35;
const LAUGH_MIN_MS = 400;
const MEDIA_CONSTRAINTS = { audio: false, video: { width: 640, height: 480, facingMode: 'user' } };

/** @typedef {{ startTime: number, endTime: number, peakScore: number }} LaughEvent */

// --- DOM refs (set on init) ---
let setupEl, gameEl, resultsEl, loadingEl, loadingText;
let startBtn, abortBtn, retryBtn, smileSlider, smileValEl;
let webcamEl, overlayCanvas, laughMeterFill, laughStatusEl;
let statBreaks, statSurvival, statStreak;
let timelineEl, timelineSegments, timelinePlayhead, timelineDurationEl;
let resultsTimeline, resultsTimelineSegments;
let replayVideoEl;

// --- runtime state ---
/** @type {YT.Player | null} */
let ytPlayer = null;
/** @type {FaceLandmarker | null} */
let faceLandmarker = null;
let mediaStream = null;
/** @type {MediaRecorder | null} */
let mediaRecorder = null;
let recordedChunks = [];
let animationFrameId = null;
let gameActive = false;
let smileThreshold = 0.45;
let videoDuration = 0;

/** @type {LaughEvent[]} */
let laughEvents = [];
let breakCount = 0;
let laughCandidateStart = null;
let laughCandidateVideoTime = null;
let laughCandidatePeak = 0;
let isLaughingNow = false;
let currentLaughStart = null;
let streakStartVideoTime = 0;
let longestStreakSec = 0;
let lastFrameTime = 0;

// --- utilities ---

function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
}

function parseYouTubeId(url) {
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/,
    );
    return match ? match[1] : null;
}

function getVideoTime() {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') {
        return 0;
    }
    return ytPlayer.getCurrentTime();
}

function showLoading(msg) {
    loadingText.textContent = msg;
    loadingEl.hidden = false;
}

function hideLoading() {
    loadingEl.hidden = true;
}

function blendshapeMap(categories) {
    const map = {};
    for (const cat of categories) {
        map[cat.categoryName] = cat.score;
    }
    return map;
}

function laughScore(blendshapes) {
    const smile = ((blendshapes.mouthSmileLeft || 0) + (blendshapes.mouthSmileRight || 0)) / 2;
    const jaw = blendshapes.jawOpen || 0;
    const score = Math.max(smile, jaw * 0.9);
    const laughing = smile >= smileThreshold || jaw >= JAW_THRESHOLD;
    return { smile, jaw, score, laughing };
}

function updateLaughMeter(score, laughing) {
    laughMeterFill.style.width = `${Math.min(100, score * 100)}%`;
    laughStatusEl.textContent = laughing ? 'LAUGHING!' : 'Holding…';
    laughStatusEl.classList.toggle('laughing', laughing);
}

function updateStats() {
    statBreaks.textContent = String(breakCount);
    const survival = getVideoTime();
    statSurvival.textContent = formatTime(survival);
    const streak = Math.max(0, survival - streakStartVideoTime);
    statStreak.textContent = formatTime(streak);
}

function updatePlayhead() {
    if (!videoDuration) {
        return;
    }
    const pct = (getVideoTime() / videoDuration) * 100;
    timelinePlayhead.style.left = `${pct}%`;
    updateStats();
}

function renderTimelineSegment(container, event, clickable) {
    if (!videoDuration) {
        return;
    }
    const seg = document.createElement('div');
    seg.className = 'ylyl-timeline-segment';
    const left = (event.startTime / videoDuration) * 100;
    const width = Math.max(0.3, ((event.endTime - event.startTime) / videoDuration) * 100);
    seg.style.left = `${left}%`;
    seg.style.width = `${width}%`;
    seg.title = `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`;
    if (clickable && ytPlayer) {
        seg.addEventListener('click', () => {
            ytPlayer.seekTo(event.startTime, true);
            ytPlayer.playVideo();
        });
    }
    container.appendChild(seg);
}

function addLaughSegmentToTimeline(event) {
    renderTimelineSegment(timelineSegments, event, false);
    renderTimelineSegment(resultsTimelineSegments, event, true);
}

function finalizeLaughEvent(endVideoTime, peakScore) {
    if (currentLaughStart === null) {
        return;
    }
    const event = {
        startTime: currentLaughStart,
        endTime: endVideoTime,
        peakScore,
    };
    laughEvents.push(event);
    addLaughSegmentToTimeline(event);
    breakCount += 1;
    currentLaughStart = null;
    streakStartVideoTime = endVideoTime;
}

function processLaughDetection(laughing, score, videoTime, nowMs) {
    if (laughing) {
        if (laughCandidateStart === null) {
            laughCandidateStart = nowMs;
            laughCandidateVideoTime = videoTime;
            laughCandidatePeak = score;
        } else {
            laughCandidatePeak = Math.max(laughCandidatePeak, score);
        }

        const sustained = nowMs - laughCandidateStart >= LAUGH_MIN_MS;
        if (sustained && !isLaughingNow) {
            isLaughingNow = true;
            currentLaughStart = laughCandidateVideoTime;
            const streakLen = laughCandidateVideoTime - streakStartVideoTime;
            longestStreakSec = Math.max(longestStreakSec, streakLen);
        }
    } else {
        if (isLaughingNow && currentLaughStart !== null) {
            finalizeLaughEvent(videoTime, laughCandidatePeak);
        }
        laughCandidateStart = null;
        laughCandidateVideoTime = null;
        laughCandidatePeak = 0;
        isLaughingNow = false;
    }
}

// --- MediaPipe ---

async function loadFaceLandmarker() {
    if (faceLandmarker) {
        return faceLandmarker;
    }
    showLoading('Loading MediaPipe models…');
    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
    });
    return faceLandmarker;
}

// --- YouTube IFrame API ---

function loadYouTubeApi() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve();
            return;
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (prev) {
                prev();
            }
            resolve();
        };
        const tag = document.createElement('script');
        const protocol = window.location.protocol === 'http:' ? 'http:' : 'https:';
        tag.src = `${protocol}//www.youtube.com/iframe_api`;
        document.head.appendChild(tag);
    });
}

function createYouTubePlayer(videoId) {
    return new Promise((resolve) => {
        ytPlayer = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId,
            playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
            events: {
                onReady: (e) => resolve(e.target),
                onStateChange: onPlayerStateChange,
            },
        });
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        endGame();
    }
}

// --- webcam + detection loop ---

async function startWebcam() {
    mediaStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    webcamEl.srcObject = mediaStream;
    await webcamEl.play();

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.start(1000);
}

function drawOverlay(detected) {
    const ctx = overlayCanvas.getContext('2d');
    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!detected || !detected.faceLandmarks.length) {
        return;
    }

    ctx.strokeStyle = isLaughingNow ? '#f44336' : '#4caf50';
    ctx.lineWidth = 2;
    for (const landmarks of detected.faceLandmarks) {
        for (const pt of landmarks) {
            ctx.beginPath();
            ctx.arc(pt.x * w, pt.y * h, 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function runDetectionLoop() {
    if (!gameActive || !faceLandmarker) {
        return;
    }

    const now = performance.now();
    if (webcamEl.readyState >= 2) {
        overlayCanvas.width = webcamEl.videoWidth;
        overlayCanvas.height = webcamEl.videoHeight;

        const result = faceLandmarker.detectForVideo(webcamEl, now);
        drawOverlay(result);

        let score = 0;
        let laughing = false;
        if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
            const shapes = blendshapeMap(result.faceBlendshapes[0].categories);
            const parsed = laughScore(shapes);
            score = parsed.score;
            laughing = parsed.laughing;
        }

        const videoTime = getVideoTime();
        processLaughDetection(laughing, score, videoTime, now);
        updateLaughMeter(score, isLaughingNow || laughing);
    }

    updatePlayhead();
    lastFrameTime = now;
    animationFrameId = requestAnimationFrame(runDetectionLoop);
}

function stopDetectionLoop() {
    gameActive = false;
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function cleanupMedia() {
    stopDetectionLoop();

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
    }

    webcamEl.srcObject = null;

    if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        ytPlayer.destroy();
        ytPlayer = null;
    }
}

// --- game flow ---

async function startGame() {
    const url = document.getElementById('youtube-link').value.trim();
    const videoId = parseYouTubeId(url);
    if (!videoId) {
        alert("That doesn't look like a YouTube link.");
        return;
    }

    smileThreshold = parseFloat(smileSlider.value);
    resetState();

    startBtn.disabled = true;
    showLoading('Loading YouTube API…');

    try {
        await loadYouTubeApi();
        showLoading('Loading face detection…');
        await loadFaceLandmarker();
        showLoading('Starting webcam…');
        await startWebcam();
        showLoading('Loading video…');
        await createYouTubePlayer(videoId);

        videoDuration = ytPlayer.getDuration() || 0;
        timelineDurationEl.textContent = formatTime(videoDuration);

        setupEl.hidden = true;
        resultsEl.hidden = true;
        gameEl.hidden = false;
        hideLoading();

        gameActive = true;
        streakStartVideoTime = 0;
        runDetectionLoop();
        ytPlayer.playVideo();
    } catch (err) {
        console.error(err);
        alert(`Failed to start: ${err.message || err}`);
        hideLoading();
        cleanupMedia();
        resetUi();
    } finally {
        startBtn.disabled = false;
    }
}

function resetState() {
    laughEvents = [];
    breakCount = 0;
    laughCandidateStart = null;
    laughCandidateVideoTime = null;
    laughCandidatePeak = 0;
    isLaughingNow = false;
    currentLaughStart = null;
    streakStartVideoTime = 0;
    longestStreakSec = 0;
    videoDuration = 0;
    recordedChunks = [];
    timelineSegments.innerHTML = '';
    resultsTimelineSegments.innerHTML = '';
    updateLaughMeter(0, false);
    statBreaks.textContent = '0';
    statSurvival.textContent = '0:00';
    statStreak.textContent = '0:00';
}

function resetUi() {
    setupEl.hidden = false;
    gameEl.hidden = true;
    resultsEl.hidden = true;
}

function endGame() {
    if (!gameActive) {
        return;
    }

    const endTime = getVideoTime();
    if (isLaughingNow && currentLaughStart !== null) {
        finalizeLaughEvent(endTime, laughCandidatePeak);
    } else if (!isLaughingNow) {
        longestStreakSec = Math.max(longestStreakSec, endTime - streakStartVideoTime);
    }

    stopDetectionLoop();

    const finishResults = () => showResults(endTime);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = finishResults;
        mediaRecorder.stop();
    } else {
        finishResults();
    }

    if (ytPlayer) {
        ytPlayer.pauseVideo();
    }
}

function showResults(endTime) {
    gameEl.hidden = true;
    resultsEl.hidden = false;

    const survived = videoDuration > 0 ? (endTime / videoDuration) * 100 : 0;
    const title = breakCount === 0 ? 'Perfect run — you never laughed!' : 'Challenge complete!';
    document.getElementById('results-title').textContent = title;

    document.getElementById('result-breaks').textContent = String(breakCount);
    document.getElementById('result-survival-pct').textContent = `${Math.round(survived)}%`;
    document.getElementById('result-longest-streak').textContent = formatTime(longestStreakSec);
    document.getElementById('result-first-break').textContent =
        laughEvents.length > 0 ? formatTime(laughEvents[0].startTime) : '—';

    if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: recordedChunks[0].type || 'video/webm' });
        replayVideoEl.src = URL.createObjectURL(blob);
    }
}

function retry() {
    cleanupMedia();
    resetState();
    resetUi();
    document.getElementById('player').innerHTML = '';
}

// --- init ---

function bindControls() {
    startBtn.addEventListener('click', startGame);
    abortBtn.addEventListener('click', endGame);
    retryBtn.addEventListener('click', retry);

    smileSlider.addEventListener('input', () => {
        smileValEl.textContent = smileSlider.value;
    });
}

function cacheDom() {
    setupEl = document.getElementById('ylyl-setup');
    gameEl = document.getElementById('ylyl-game');
    resultsEl = document.getElementById('ylyl-results');
    loadingEl = document.getElementById('ylyl-loading');
    loadingText = document.getElementById('loading-text');

    startBtn = document.getElementById('start-btn');
    abortBtn = document.getElementById('abort-btn');
    retryBtn = document.getElementById('retry-btn');
    smileSlider = document.getElementById('smile-threshold');
    smileValEl = document.getElementById('smile-threshold-val');

    webcamEl = document.getElementById('webcam');
    overlayCanvas = document.getElementById('webcam-overlay');
    laughMeterFill = document.getElementById('laugh-meter-fill');
    laughStatusEl = document.getElementById('laugh-status');

    statBreaks = document.getElementById('stat-breaks');
    statSurvival = document.getElementById('stat-survival');
    statStreak = document.getElementById('stat-streak');

    timelineEl = document.getElementById('timeline');
    timelineSegments = document.getElementById('timeline-segments');
    timelinePlayhead = document.getElementById('timeline-playhead');
    timelineDurationEl = document.getElementById('timeline-duration');

    resultsTimeline = document.getElementById('results-timeline');
    resultsTimelineSegments = document.getElementById('results-timeline-segments');
    replayVideoEl = document.getElementById('replay-video');
}

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    bindControls();
});
