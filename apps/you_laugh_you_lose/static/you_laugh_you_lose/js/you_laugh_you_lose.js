import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const FACE_MODEL =
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const MEDIA_CONSTRAINTS = { audio: false, video: { width: 640, height: 480, facingMode: 'user' } };
const TIMELINE_HEIGHT = 80;

/** Minimal embed: no control bar, same-channel rel only, no annotations/captions. */
const YOUTUBE_PLAYER_VARS = {
    playsinline: 1,
    rel: 0,
    modestbranding: 1,
    controls: 0,
    iv_load_policy: 3,
    cc_load_policy: 0,
    fs: 0,
    disablekb: 1,
    origin: window.location.origin,
};

/** @typedef {{ t: number, smileLeft: number, smileRight: number, smile: number, jaw: number, score: number }} ExpressionSample */

// --- DOM refs ---
let setupEl, gameEl, resultsEl, loadingEl, loadingText;
let startBtn, abortBtn, retryBtn;
let webcamEl, overlayCanvas;
let smileMeterFill, jawMeterFill, smileMeterVal, jawMeterVal;
let statPeak, statAvg, statElapsed;
let timelineCanvas, timelinePlayhead, timelineDurationEl;
let resultsTimelineCanvas, resultsTimelinePlayhead, resultsTimelineDurationEl;
let replayVideoEl, funniestMomentCard, playerHostGame, playerHostResults;

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
let videoDuration = 0;

/** @type {ExpressionSample[]} */
let expressionSamples = [];
let sessionPeak = 0;
let sessionPeakTime = 0;
let sessionEndTime = 0;
let lastExpression = null;

// --- utilities ---

function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
}

function formatScore(value) {
    return value.toFixed(2);
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

function parseExpression(blendshapes) {
    const smileLeft = blendshapes.mouthSmileLeft || 0;
    const smileRight = blendshapes.mouthSmileRight || 0;
    const smile = (smileLeft + smileRight) / 2;
    const jaw = blendshapes.jawOpen || 0;
    const score = Math.max(smile, jaw);
    return { smileLeft, smileRight, smile, jaw, score };
}

function recordExpression(videoTime, expr) {
    const sample = { t: videoTime, ...expr };
    expressionSamples.push(sample);

    if (expr.score > sessionPeak) {
        sessionPeak = expr.score;
        sessionPeakTime = videoTime;
    }
    lastExpression = expr;
}

function computeAverage(samples) {
    if (samples.length === 0) {
        return 0;
    }
    const total = samples.reduce((sum, s) => sum + s.score, 0);
    return total / samples.length;
}

function updateMeters(expr) {
    smileMeterFill.style.width = `${Math.min(100, expr.smile * 100)}%`;
    jawMeterFill.style.width = `${Math.min(100, expr.jaw * 100)}%`;
    smileMeterVal.textContent = formatScore(expr.smile);
    jawMeterVal.textContent = formatScore(expr.jaw);
}

function updateStats() {
    const elapsed = getVideoTime();
    statPeak.textContent = formatScore(sessionPeak);
    statAvg.textContent = formatScore(computeAverage(expressionSamples));
    statElapsed.textContent = formatTime(elapsed);
}

function updatePlayhead() {
    if (!videoDuration) {
        return;
    }
    const pct = (getVideoTime() / videoDuration) * 100;
    timelinePlayhead.style.left = `${pct}%`;
    updateStats();
}

function mountPlayer(hostEl) {
    const playerEl = document.getElementById('player');
    hostEl.appendChild(playerEl);
}

function seekReplay(seekTime) {
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        ytPlayer.seekTo(seekTime, true);
        ytPlayer.playVideo();
    }
    if (replayVideoEl && replayVideoEl.src) {
        replayVideoEl.currentTime = Math.min(seekTime, replayVideoEl.duration || seekTime);
        replayVideoEl.play().catch(() => {});
    }
    updateResultsPlayhead(seekTime);
    renderResultsTimeline(seekTime);
}

function renderResultsTimeline(playheadTime) {
    renderExpressionTimeline(resultsTimelineCanvas, expressionSamples, sessionEndTime, {
        playheadTime,
        clickable: true,
        onSeek: seekReplay,
    });
}

function updateResultsPlayhead(time) {
    if (!sessionEndTime) {
        return;
    }
    const pct = (time / sessionEndTime) * 100;
    resultsTimelinePlayhead.style.left = `${pct}%`;
}

function scoreColor(score) {
    const r = Math.round(76 + score * 168);
    const g = Math.round(175 - score * 132);
    const b = Math.round(80 - score * 37);
    return `rgb(${r}, ${g}, ${b})`;
}

function renderExpressionTimeline(canvas, samples, duration, options = {}) {
    const { playheadTime = null, clickable = false, onSeek = null } = options;
    const wrap = canvas.parentElement;
    const width = wrap.clientWidth || 600;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = TIMELINE_HEIGHT * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${TIMELINE_HEIGHT}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, TIMELINE_HEIGHT);

    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, width, TIMELINE_HEIGHT);

    if (!duration || samples.length === 0) {
        return;
    }

    const buckets = new Float32Array(width);
    for (const sample of samples) {
        if (sample.t > duration) {
            continue;
        }
        const x = Math.min(width - 1, Math.floor((sample.t / duration) * width));
        buckets[x] = Math.max(buckets[x], sample.score);
    }

    ctx.beginPath();
    ctx.moveTo(0, TIMELINE_HEIGHT);
    for (let x = 0; x < width; x++) {
        const y = TIMELINE_HEIGHT - buckets[x] * (TIMELINE_HEIGHT - 4);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(width, TIMELINE_HEIGHT);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, TIMELINE_HEIGHT);
    gradient.addColorStop(0, 'rgba(244, 67, 54, 0.85)');
    gradient.addColorStop(0.5, 'rgba(255, 152, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0.35)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const y = TIMELINE_HEIGHT - buckets[x] * (TIMELINE_HEIGHT - 4);
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (playheadTime !== null) {
        const px = (playheadTime / duration) * width;
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, TIMELINE_HEIGHT);
        ctx.stroke();
    }

    if (clickable && onSeek) {
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const seekTime = (x / rect.width) * duration;
            onSeek(seekTime);
        };
    } else {
        canvas.onclick = null;
    }
}

function refreshLiveTimeline() {
    renderExpressionTimeline(timelineCanvas, expressionSamples, videoDuration, {
        playheadTime: getVideoTime(),
    });
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
            playerVars: YOUTUBE_PLAYER_VARS,
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
        return;
    }
    // Keep the challenge running — pausing shows cluttered YouTube overlays.
    if (gameActive && event.data === YT.PlayerState.PAUSED && ytPlayer) {
        ytPlayer.playVideo();
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

function drawOverlay(detected, expr) {
    const ctx = overlayCanvas.getContext('2d');
    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!detected || !detected.faceLandmarks.length) {
        return;
    }

    const score = expr ? expr.score : 0;
    ctx.strokeStyle = scoreColor(score);
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
        const videoTime = getVideoTime();

        let expr = { smileLeft: 0, smileRight: 0, smile: 0, jaw: 0, score: 0 };
        if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
            const shapes = blendshapeMap(result.faceBlendshapes[0].categories);
            expr = parseExpression(shapes);
            recordExpression(videoTime, expr);
            updateMeters(expr);
            refreshLiveTimeline();
        }

        drawOverlay(result, expr);
    }

    updatePlayhead();
    animationFrameId = requestAnimationFrame(runDetectionLoop);
}

function stopDetectionLoop() {
    gameActive = false;
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function stopWebcam() {
    if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
    }
    if (webcamEl) {
        webcamEl.srcObject = null;
    }
}

function cleanupMedia() {
    stopDetectionLoop();

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    stopWebcam();

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
        mountPlayer(playerHostGame);
        await createYouTubePlayer(videoId);

        videoDuration = ytPlayer.getDuration() || 0;
        timelineDurationEl.textContent = formatTime(videoDuration);
        refreshLiveTimeline();

        setupEl.hidden = true;
        resultsEl.hidden = true;
        gameEl.hidden = false;
        hideLoading();

        gameActive = true;
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
    expressionSamples = [];
    sessionPeak = 0;
    sessionPeakTime = 0;
    sessionEndTime = 0;
    lastExpression = null;
    videoDuration = 0;
    recordedChunks = [];

    updateMeters({ smileLeft: 0, smileRight: 0, smile: 0, jaw: 0, score: 0 });
    statPeak.textContent = '0.00';
    statAvg.textContent = '0.00';
    statElapsed.textContent = '0:00';
    timelinePlayhead.style.left = '0%';
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

    stopDetectionLoop();

    const finishResults = () => {
        stopWebcam();
        showResults(getVideoTime());
    };
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

    sessionEndTime = Math.max(endTime, sessionPeakTime, expressionSamples.at(-1)?.t ?? 0);
    const watched = videoDuration > 0 ? (sessionEndTime / videoDuration) * 100 : 0;

    document.getElementById('results-title').textContent = 'Challenge complete!';
    document.getElementById('result-peak').textContent = formatScore(sessionPeak);
    document.getElementById('result-peak-at').textContent =
        sessionPeak > 0 ? formatTime(sessionPeakTime) : '—';
    document.getElementById('result-survival-pct').textContent = `${Math.round(watched)}%`;

    funniestMomentCard.classList.toggle('ylyl-result-card-disabled', sessionPeak <= 0);
    resultsTimelineDurationEl.textContent = formatTime(sessionEndTime);

    mountPlayer(playerHostResults);

    if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: recordedChunks[0].type || 'video/webm' });
        replayVideoEl.src = URL.createObjectURL(blob);
    }

    renderResultsTimeline(endTime);
    updateResultsPlayhead(endTime);
}

function retry() {
    cleanupMedia();
    resetState();
    resetUi();
    document.getElementById('player').innerHTML = '';
    mountPlayer(playerHostGame);
}

// --- init ---

function bindControls() {
    startBtn.addEventListener('click', startGame);
    abortBtn.addEventListener('click', endGame);
    retryBtn.addEventListener('click', retry);

    funniestMomentCard.addEventListener('click', () => {
        if (sessionPeakTime > 0) {
            seekReplay(sessionPeakTime);
        }
    });
    funniestMomentCard.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && sessionPeakTime > 0) {
            e.preventDefault();
            seekReplay(sessionPeakTime);
        }
    });

    window.addEventListener('resize', () => {
        if (gameActive) {
            refreshLiveTimeline();
        } else if (!resultsEl.hidden && expressionSamples.length > 0) {
            const playhead = ytPlayer ? ytPlayer.getCurrentTime() : sessionEndTime;
            renderResultsTimeline(playhead);
            updateResultsPlayhead(playhead);
        }
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

    webcamEl = document.getElementById('webcam');
    overlayCanvas = document.getElementById('webcam-overlay');
    smileMeterFill = document.getElementById('smile-meter-fill');
    jawMeterFill = document.getElementById('jaw-meter-fill');
    smileMeterVal = document.getElementById('smile-meter-val');
    jawMeterVal = document.getElementById('jaw-meter-val');

    statPeak = document.getElementById('stat-peak');
    statAvg = document.getElementById('stat-avg');
    statElapsed = document.getElementById('stat-elapsed');

    timelineCanvas = document.getElementById('timeline-canvas');
    timelinePlayhead = document.getElementById('timeline-playhead');
    timelineDurationEl = document.getElementById('timeline-duration');

    resultsTimelineCanvas = document.getElementById('results-timeline-canvas');
    resultsTimelinePlayhead = document.getElementById('results-timeline-playhead');
    resultsTimelineDurationEl = document.getElementById('results-timeline-duration');
    replayVideoEl = document.getElementById('replay-video');
    funniestMomentCard = document.getElementById('funniest-moment-card');
    playerHostGame = document.getElementById('player-host-game');
    playerHostResults = document.getElementById('player-host-results');
}

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    bindControls();
});
