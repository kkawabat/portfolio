const DEG = Math.PI / 180;

/** Physics and layout happen in this fixed coordinate space; the canvas scales to fit. */
const VIEW = { width: 960, height: 600 };

const PADDLE = {
    width: 150,
    height: 16,
    bottomMargin: 34,
    acceleration: 5200,
    maxSpeed: 1300,
    drag: 4.0,
    /** How far the paddle leans with the phone, and how quickly it eases there. */
    maxTilt: 12 * DEG,
    tiltResponse: 12,
};

const BALL = {
    radius: 9,
    baseSpeed: 470,
    speedPerLevel: 45,
    speedPerBrick: 3.5,
    maxSpeed: 950,
    maxBounceAngle: 62 * DEG,
    minVerticalRatio: 0.28,
    paddleSpin: 0.14,
    /** How much the paddle's lean steers the bounce, so it deflects the way it looks. */
    paddleAngleInfluence: 0.6,
};

const BRICK = {
    columns: 10,
    sideMargin: 26,
    topMargin: 64,
    height: 26,
    gap: 6,
    rowColors: ['#ff5c5c', '#ff9f1c', '#ffd60a', '#4ade80', '#38bdf8', '#a78bfa'],
};

/** Roll away from the player's neutral grip that earns full paddle acceleration. */
const TILT_FULL_DEFLECTION = 22 * DEG;
const TILT_DEADZONE = 0.05;

const STARTING_LIVES = 3;
const PHYSICS_STEP = 1 / 120;
const MAX_FRAME_TIME = 0.1;

const Phase = {
    SETUP: 'setup',
    SERVING: 'serving',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
};

// --- DOM refs ---
let stageEl, canvas, ctx;
let scoreEl, levelEl, livesEl, footnoteEl;
let overlayEl, overlayTitle, overlayText, overlayNote, primaryBtn;
let tiltPreviewEl, tiltMarkerEl, rotateNagEl;
let pauseBtn, fullscreenBtn, exitFullscreenBtn;

// --- runtime state ---
let phase = Phase.SETUP;
let renderScale = 1;
let animationFrameId = null;
let lastFrameTime = 0;
let physicsAccumulator = 0;
let wakeLock = null;

const paddle = { x: VIEW.width / 2, velocity: 0, angle: 0 };
const ball = { x: 0, y: 0, vx: 0, vy: 0, speed: BALL.baseSpeed };
let bricks = [];
let bricksRemaining = 0;
let score = 0;
let level = 1;
let lives = STARTING_LIVES;

const tilt = {
    supported: typeof DeviceOrientationEvent !== 'undefined',
    needsPermission: typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function',
    listening: false,
    receiving: false,
    roll: 0,
    neutral: 0,
    awaitingCalibration: false,
};

const pointer = { active: false, x: VIEW.width / 2 };
const keys = { left: false, right: false };

// --- utilities ---

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function isTouchDevice() {
    return window.matchMedia('(pointer: coarse)').matches;
}

function fillRounded(x, y, width, height, radius) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.rect(x, y, width, height);
    }
    ctx.fill();
}

// --- tilt input ---

function currentScreenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === 'number') {
        return screen.orientation.angle;
    }
    return typeof window.orientation === 'number' ? window.orientation : 0;
}

/**
 * Roll angle of the screen about its own vertical axis, in radians: negative when the
 * screen's left edge dips, positive when its right edge does, 0 when the screen is level.
 *
 * The orientation angles describe a Z-X'-Y'' rotation of the device, so gravity in device
 * coordinates is (cosB sinG, -sinB, -cosB cosG). Rotating that by the screen's own angle
 * gives its horizontal component, which is the sine of the roll — so one formula covers
 * portrait and both landscape directions. Working in angle rather than sine keeps the
 * calibrated neutral symmetric: 22 degrees of roll means the same thing from any grip.
 */
function readScreenRoll(betaDeg, gammaDeg) {
    const beta = betaDeg * DEG;
    const gamma = gammaDeg * DEG;
    const deviceX = Math.cos(beta) * Math.sin(gamma);
    const deviceY = -Math.sin(beta);
    const angle = currentScreenAngle() * DEG;
    const horizontal = deviceX * Math.cos(angle) - deviceY * Math.sin(angle);
    return Math.asin(clamp(horizontal, -1, 1));
}

function onDeviceOrientation(event) {
    if (event.beta === null || event.gamma === null) {
        return;
    }
    tilt.roll = readScreenRoll(event.beta, event.gamma);
    if (tilt.awaitingCalibration) {
        tilt.neutral = tilt.roll;
        tilt.awaitingCalibration = false;
    }
    if (!tilt.receiving) {
        tilt.receiving = true;
        onTiltAvailable();
    }
}

/** Steering signal in -1..1, relative to the grip angle captured at start. */
function tiltSteering() {
    if (!tilt.receiving) {
        return 0;
    }
    const centered = clamp((tilt.roll - tilt.neutral) / TILT_FULL_DEFLECTION, -1, 1);
    return Math.abs(centered) < TILT_DEADZONE ? 0 : centered;
}

function keyboardSteering() {
    return (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
}

async function enableTilt() {
    if (!tilt.supported) {
        return false;
    }
    if (tilt.needsPermission) {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission !== 'granted') {
                return false;
            }
        } catch {
            return false;
        }
    }
    if (!tilt.listening) {
        window.addEventListener('deviceorientation', onDeviceOrientation);
        tilt.listening = true;
    }
    return true;
}

/**
 * Zero the steering on the player's current grip. On iOS the permission prompt resolves
 * before the first reading arrives, so defer to the next event rather than calibrating on
 * a roll of 0 the player never actually held.
 */
function calibrateTilt() {
    if (tilt.receiving) {
        tilt.neutral = tilt.roll;
    } else {
        tilt.awaitingCalibration = true;
    }
}

function onTiltAvailable() {
    tiltPreviewEl.hidden = false;
    footnoteEl.textContent = 'Tilt left and right to steer. Tap the board to launch the ball.';
}

// --- level construction ---

function buildLevel(levelNumber) {
    const rows = Math.min(3 + levelNumber, BRICK.rowColors.length);
    const usableWidth = VIEW.width - BRICK.sideMargin * 2;
    const brickWidth = (usableWidth - BRICK.gap * (BRICK.columns - 1)) / BRICK.columns;

    bricks = [];
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < BRICK.columns; column++) {
            bricks.push({
                x: BRICK.sideMargin + column * (brickWidth + BRICK.gap),
                y: BRICK.topMargin + row * (BRICK.height + BRICK.gap),
                width: brickWidth,
                height: BRICK.height,
                color: BRICK.rowColors[row],
                points: (rows - row) * 10,
                alive: true,
            });
        }
    }
    bricksRemaining = bricks.length;
}

function paddleTop() {
    return VIEW.height - PADDLE.bottomMargin - PADDLE.height;
}

function serveBall() {
    phase = Phase.SERVING;
    ball.speed = BALL.baseSpeed + (level - 1) * BALL.speedPerLevel;
    ball.x = paddle.x;
    ball.y = paddleTop() - BALL.radius - 1;
    ball.vx = 0;
    ball.vy = 0;
    showOverlay({
        title: 'Ready',
        text: isTouchDevice() ? 'Tap to launch' : 'Press space or click to launch',
        button: null,
    });
}

function launchBall() {
    if (phase !== Phase.SERVING) {
        return;
    }
    const angle = (Math.random() * 40 - 20) * DEG;
    ball.vx = Math.sin(angle) * ball.speed;
    ball.vy = -Math.cos(angle) * ball.speed;
    phase = Phase.PLAYING;
    hideOverlay();
    requestWakeLock();
}

function startGame() {
    score = 0;
    level = 1;
    lives = STARTING_LIVES;
    paddle.x = VIEW.width / 2;
    paddle.velocity = 0;
    buildLevel(level);
    updateHud();
    serveBall();
}

// --- simulation ---

function stepPaddle(dt) {
    if (pointer.active) {
        const previous = paddle.x;
        paddle.x = clamp(pointer.x, PADDLE.width / 2, VIEW.width - PADDLE.width / 2);
        paddle.velocity = (paddle.x - previous) / dt;
    } else {
        const steer = tiltSteering() || keyboardSteering();
        paddle.velocity += steer * PADDLE.acceleration * dt;
        paddle.velocity *= Math.exp(-PADDLE.drag * dt);
        paddle.velocity = clamp(paddle.velocity, -PADDLE.maxSpeed, PADDLE.maxSpeed);
        paddle.x += paddle.velocity * dt;

        const leftLimit = PADDLE.width / 2;
        const rightLimit = VIEW.width - PADDLE.width / 2;
        if (paddle.x < leftLimit) {
            paddle.x = leftLimit;
            paddle.velocity = 0;
        } else if (paddle.x > rightLimit) {
            paddle.x = rightLimit;
            paddle.velocity = 0;
        }
    }

    stepPaddleLean(dt);
}

/**
 * The paddle leans the way the phone is held, easing toward the target so it does not
 * jitter with sensor noise. Without a motion sensor it leans into its own movement
 * instead, so mouse and keyboard play still reads the same way.
 */
function stepPaddleLean(dt) {
    const lean = tilt.receiving
        ? tiltSteering()
        : clamp(paddle.velocity / PADDLE.maxSpeed, -1, 1);
    const target = lean * PADDLE.maxTilt;
    paddle.angle += (target - paddle.angle) * Math.min(1, dt * PADDLE.tiltResponse);
}

function setBallDirection(vx, vy, speed) {
    const magnitude = Math.hypot(vx, vy) || 1;
    let nx = vx / magnitude;
    let ny = vy / magnitude;

    // Keep the ball from settling into a near-horizontal path it can never escape.
    if (Math.abs(ny) < BALL.minVerticalRatio) {
        ny = Math.sign(ny || -1) * BALL.minVerticalRatio;
        nx = Math.sign(nx || 1) * Math.sqrt(1 - ny * ny);
    }

    ball.vx = nx * speed;
    ball.vy = ny * speed;
}

function bounceOffPaddle() {
    const top = paddleTop();
    const withinX = Math.abs(ball.x - paddle.x) <= PADDLE.width / 2 + BALL.radius;
    const withinY = ball.y + BALL.radius >= top && ball.y - BALL.radius <= top + PADDLE.height;
    if (ball.vy <= 0 || !withinX || !withinY) {
        return;
    }

    // Rotating the paddle rotates its surface normal, so a paddle that visibly leans
    // right sends the ball right — the bounce matches what the player can see.
    const offset = clamp((ball.x - paddle.x) / (PADDLE.width / 2), -1, 1);
    const angle = clamp(
        offset * BALL.maxBounceAngle + paddle.angle * BALL.paddleAngleInfluence,
        -BALL.maxBounceAngle,
        BALL.maxBounceAngle,
    );
    const spin = paddle.velocity * BALL.paddleSpin;
    setBallDirection(Math.sin(angle) * ball.speed + spin, -Math.cos(angle) * ball.speed, ball.speed);
    ball.y = top - BALL.radius;
}

function bounceOffWalls() {
    if (ball.x - BALL.radius < 0) {
        ball.x = BALL.radius;
        ball.vx = Math.abs(ball.vx);
    } else if (ball.x + BALL.radius > VIEW.width) {
        ball.x = VIEW.width - BALL.radius;
        ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y - BALL.radius < 0) {
        ball.y = BALL.radius;
        ball.vy = Math.abs(ball.vy);
    }
}

function hitBrick(brick) {
    brick.alive = false;
    bricksRemaining -= 1;
    score += brick.points;
    ball.speed = Math.min(ball.speed + BALL.speedPerBrick, BALL.maxSpeed);
    setBallDirection(ball.vx, ball.vy, ball.speed);
    updateHud();
}

function collideWithBricks() {
    for (const brick of bricks) {
        if (!brick.alive) {
            continue;
        }
        const nearestX = clamp(ball.x, brick.x, brick.x + brick.width);
        const nearestY = clamp(ball.y, brick.y, brick.y + brick.height);
        const dx = ball.x - nearestX;
        const dy = ball.y - nearestY;
        if (dx * dx + dy * dy > BALL.radius * BALL.radius) {
            continue;
        }

        const centerX = brick.x + brick.width / 2;
        const centerY = brick.y + brick.height / 2;
        const overlapX = brick.width / 2 + BALL.radius - Math.abs(ball.x - centerX);
        const overlapY = brick.height / 2 + BALL.radius - Math.abs(ball.y - centerY);

        if (overlapX < overlapY) {
            const direction = Math.sign(ball.x - centerX) || 1;
            ball.x += direction * overlapX;
            ball.vx = Math.abs(ball.vx) * direction;
        } else {
            const direction = Math.sign(ball.y - centerY) || -1;
            ball.y += direction * overlapY;
            ball.vy = Math.abs(ball.vy) * direction;
        }

        hitBrick(brick);
        return;
    }
}

function loseLife() {
    lives -= 1;
    updateHud();
    releaseWakeLock();
    if (lives <= 0) {
        phase = Phase.GAME_OVER;
        showOverlay({
            title: 'Game over',
            text: `You scored ${score} on level ${level}.`,
            button: 'Play again',
        });
        return;
    }
    paddle.velocity = 0;
    serveBall();
}

function advanceLevel() {
    level += 1;
    buildLevel(level);
    paddle.velocity = 0;
    updateHud();
    releaseWakeLock();
    serveBall();
    overlayTitle.textContent = `Level ${level}`;
}

function step(dt) {
    stepPaddle(dt);

    if (phase === Phase.SERVING) {
        ball.x = paddle.x;
        ball.y = paddleTop() - BALL.radius - 1;
        return;
    }
    if (phase !== Phase.PLAYING) {
        return;
    }

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    bounceOffWalls();
    collideWithBricks();
    bounceOffPaddle();

    if (bricksRemaining === 0) {
        advanceLevel();
        return;
    }
    if (ball.y - BALL.radius > VIEW.height) {
        loseLife();
    }
}

// --- rendering ---

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) {
        return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    renderScale = canvas.width / VIEW.width;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, VIEW.height);
    gradient.addColorStop(0, '#12131a');
    gradient.addColorStop(1, '#1c1d28');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function drawBricks() {
    for (const brick of bricks) {
        if (!brick.alive) {
            continue;
        }
        ctx.fillStyle = brick.color;
        fillRounded(brick.x, brick.y, brick.width, brick.height, 5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        fillRounded(brick.x, brick.y, brick.width, brick.height / 3, 5);
    }
}

function drawPaddle() {
    ctx.save();
    ctx.translate(paddle.x, paddleTop() + PADDLE.height / 2);
    ctx.rotate(paddle.angle);
    ctx.fillStyle = 'orange';
    ctx.shadowColor = 'rgba(255, 165, 0, 0.55)';
    ctx.shadowBlur = 18;
    fillRounded(-PADDLE.width / 2, -PADDLE.height / 2, PADDLE.width, PADDLE.height, 8);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function render() {
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    drawBackground();
    drawBricks();
    drawPaddle();
    drawBall();
}

function renderTiltPreview() {
    if (tiltPreviewEl.hidden) {
        return;
    }
    const steer = tiltSteering();
    tiltMarkerEl.style.transform = `translateX(${steer * 50}%)`;
}

function frame(now) {
    animationFrameId = requestAnimationFrame(frame);

    const elapsed = Math.min((now - lastFrameTime) / 1000, MAX_FRAME_TIME);
    lastFrameTime = now;

    if (phase === Phase.PLAYING || phase === Phase.SERVING) {
        physicsAccumulator += elapsed;
        while (physicsAccumulator >= PHYSICS_STEP) {
            step(PHYSICS_STEP);
            physicsAccumulator -= PHYSICS_STEP;
        }
    } else {
        physicsAccumulator = 0;
    }

    render();
    renderTiltPreview();
}

// --- ui ---

function updateHud() {
    scoreEl.textContent = String(score);
    levelEl.textContent = String(level);
    livesEl.textContent = lives > 0 ? '●'.repeat(lives) : '—';
}

function showOverlay({ title, text, button, note }) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayNote.textContent = note || '';
    if (button) {
        primaryBtn.textContent = button;
        primaryBtn.hidden = false;
    } else {
        primaryBtn.hidden = true;
    }
    overlayEl.classList.add('tb-overlay-visible');
}

function hideOverlay() {
    overlayEl.classList.remove('tb-overlay-visible');
}

function updateRotateNag() {
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    rotateNagEl.hidden = !(isTouchDevice() && portrait);
}

function togglePause() {
    if (phase === Phase.PLAYING) {
        phase = Phase.PAUSED;
        releaseWakeLock();
        showOverlay({ title: 'Paused', text: 'Take a breath.', button: 'Resume' });
    } else if (phase === Phase.PAUSED) {
        phase = Phase.PLAYING;
        hideOverlay();
        requestWakeLock();
    }
}

async function onPrimaryButton() {
    if (phase === Phase.PAUSED) {
        togglePause();
        return;
    }

    if (tilt.supported && !tilt.listening) {
        const granted = await enableTilt();
        if (!granted && isTouchDevice()) {
            overlayNote.textContent =
                'Motion access was blocked, so the paddle falls back to touch and keyboard. '
                + 'Re-enable it in your browser settings for this site.';
        }
    }
    calibrateTilt();
    startGame();
}

async function exitFullscreen() {
    if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
    }
}

async function toggleFullscreen() {
    if (document.fullscreenElement) {
        await exitFullscreen();
        return;
    }
    try {
        await stageEl.requestFullscreen();
        await screen.orientation?.lock?.('landscape');
    } catch {
        // Fullscreen or orientation lock is unavailable (notably iOS Safari); the game still plays.
    }
}

async function requestWakeLock() {
    if (wakeLock || !navigator.wakeLock) {
        return;
    }
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            wakeLock = null;
        });
    } catch {
        // Wake lock is best-effort.
    }
}

function releaseWakeLock() {
    wakeLock?.release().catch(() => {});
    wakeLock = null;
}

function canvasPointerX(event) {
    const rect = canvas.getBoundingClientRect();
    return ((event.clientX - rect.left) / rect.width) * VIEW.width;
}

function bindControls() {
    primaryBtn.addEventListener('click', onPrimaryButton);
    pauseBtn.addEventListener('click', togglePause);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    exitFullscreenBtn.addEventListener('click', exitFullscreen);

    canvas.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') {
            pointer.active = true;
            pointer.x = canvasPointerX(event);
        }
        launchBall();
    });
    canvas.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'mouse' && pointer.active) {
            pointer.x = canvasPointerX(event);
        }
    });
    canvas.addEventListener('pointerleave', () => {
        pointer.active = false;
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            keys.left = true;
        } else if (event.key === 'ArrowRight') {
            keys.right = true;
        } else if (event.key === ' ') {
            event.preventDefault();
            launchBall();
        } else if (event.key === 'p' || event.key === 'P') {
            togglePause();
        } else {
            return;
        }
        pointer.active = false;
    });
    window.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft') {
            keys.left = false;
        } else if (event.key === 'ArrowRight') {
            keys.right = false;
        }
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        updateRotateNag();
    });
    screen.orientation?.addEventListener?.('change', () => {
        resizeCanvas();
        updateRotateNag();
    });
    document.addEventListener('fullscreenchange', resizeCanvas);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && phase === Phase.PLAYING) {
            togglePause();
        }
    });
}

function cacheDom() {
    stageEl = document.getElementById('tb-stage');
    canvas = document.getElementById('tb-canvas');
    ctx = canvas.getContext('2d');

    scoreEl = document.getElementById('tb-score');
    levelEl = document.getElementById('tb-level');
    livesEl = document.getElementById('tb-lives');
    footnoteEl = document.getElementById('tb-footnote');

    overlayEl = document.getElementById('tb-overlay');
    overlayTitle = document.getElementById('tb-overlay-title');
    overlayText = document.getElementById('tb-overlay-text');
    overlayNote = document.getElementById('tb-overlay-note');
    primaryBtn = document.getElementById('tb-primary-btn');

    tiltPreviewEl = document.getElementById('tb-tilt-preview');
    tiltMarkerEl = document.getElementById('tb-tilt-marker');
    rotateNagEl = document.getElementById('tb-rotate-nag');

    pauseBtn = document.getElementById('tb-pause-btn');
    fullscreenBtn = document.getElementById('tb-fullscreen-btn');
    exitFullscreenBtn = document.getElementById('tb-exit-fullscreen');
}

function init() {
    cacheDom();
    bindControls();
    resizeCanvas();
    updateRotateNag();
    updateHud();
    buildLevel(level);

    paddle.x = VIEW.width / 2;
    ball.x = paddle.x;
    ball.y = paddleTop() - BALL.radius - 1;

    if (!tilt.supported && isTouchDevice()) {
        overlayNote.textContent = 'This device does not report motion, so play with touch instead.';
    }

    overlayEl.classList.add('tb-overlay-visible');
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(frame);
}

document.addEventListener('DOMContentLoaded', init);
