/* global cv, OPENCV_JS_URL, CASCADE_URL, headerSelected */

(function() {
    'use strict';

    // --- distance / detection helpers (ported from opencv_cam_distance_measurer) ---

    var EYE_DISTANCE_MM = 61;
    var LOGI_WEBCAM_FOCAL_LENGTH_MM = 3.67;
    var LOGI_WEBCAM_SENSOR_MM_HEIGHT = 2.72;
    var QR_CODE_SIZE_MM = 37;

    var selected_detector_type = null;
    var mediaStream = null;
    var animationFrameId = null;
    var detector = null;
    var opencvReady = false;

    var videoEl = null;
    var captureCanvas = null;
    var outputCanvas = null;

    var mediaConstraints = { audio: false, video: { width: 320, height: 240 } };

    function distanceToFace(eyePixelDist, sensorPixelHeight) {
        var distanceRaw = LOGI_WEBCAM_FOCAL_LENGTH_MM * EYE_DISTANCE_MM * sensorPixelHeight
            / eyePixelDist * LOGI_WEBCAM_SENSOR_MM_HEIGHT;
        return distanceRaw * 0.0046;
    }

    function distanceToQr(qrPixelHeight, sensorPixelHeight) {
        var distanceRaw = LOGI_WEBCAM_FOCAL_LENGTH_MM * QR_CODE_SIZE_MM * sensorPixelHeight
            / qrPixelHeight * LOGI_WEBCAM_SENSOR_MM_HEIGHT;
        return distanceRaw * 0.0046;
    }

    function getAngle(a, b, c) {
        var ba = [b.x - a.x, b.y - a.y];
        var bc = [b.x - c.x, b.y - c.y];
        var dot = ba[0] * bc[0] + ba[1] * bc[1];
        var norm = Math.hypot(ba[0], ba[1]) * Math.hypot(bc[0], bc[1]);
        return Math.abs(Math.acos(dot / norm) * (180 / Math.PI));
    }

    function getQuadrilateralSkewness(corners) {
        var ll = corners[0];
        var ul = corners[1];
        var ur = corners[2];
        var lr = corners[3];
        var angles = [
            getAngle(ul, ur, lr),
            getAngle(ur, lr, ll),
            getAngle(lr, ll, ul),
            getAngle(ll, ul, ur),
        ];
        var angleMax = Math.max.apply(null, angles);
        var angleMin = Math.min.apply(null, angles);
        return Math.max((angleMax - 90) / 90, (90 - angleMin) / 90);
    }

    function isValidQrBbox(corners) {
        return getQuadrilateralSkewness(corners) <= 0.5;
    }

    function estimateEyePixelDist(face) {
        return face.width * 0.65;
    }

    function estimateEyeCoord(face) {
        return {
            x: Math.round(face.x + face.width * 0.5),
            y: Math.round(face.y + face.height * 0.38),
        };
    }

    function drawDistanceInfo(mat, distInches, coord) {
        cv.putText(
            mat,
            distInches.toFixed(2) + 'in',
            new cv.Point(coord.x, coord.y),
            cv.FONT_HERSHEY_SIMPLEX,
            1,
            new cv.Scalar(255, 0, 0, 255),
            2,
        );
    }

    function drawFaceRect(mat, face) {
        cv.rectangle(
            mat,
            new cv.Point(face.x, face.y),
            new cv.Point(face.x + face.width, face.y + face.height),
            new cv.Scalar(255, 255, 255, 255),
            2,
        );
    }

    function drawQrBbox(mat, corners) {
        for (var i = 0; i < corners.length; i++) {
            cv.line(
                mat,
                new cv.Point(corners[i].x, corners[i].y),
                new cv.Point(corners[(i + 1) % corners.length].x, corners[(i + 1) % corners.length].y),
                new cv.Scalar(255, 0, 0, 255),
                2,
            );
        }
    }

    function matCornersFromQrPoints(pointsMat) {
        var corners = [];
        var i;
        if (pointsMat.rows === 4) {
            for (i = 0; i < 4; i++) {
                corners.push({ x: pointsMat.data32F[i * 2], y: pointsMat.data32F[i * 2 + 1] });
            }
        } else if (pointsMat.cols >= 8) {
            for (i = 0; i < 4; i++) {
                corners.push({
                    x: pointsMat.floatAt(0, i * 2),
                    y: pointsMat.floatAt(0, i * 2 + 1),
                });
            }
        }
        return corners;
    }

    function qrPixelHeight(corners) {
        return Math.abs(corners[2].y - corners[0].y);
    }

    function OpenCvDetector(cascadeUrl) {
        this.cascadeUrl = cascadeUrl;
        this.faceClassifier = null;
        this.qrDetector = null;
        this.initialized = false;
    }

    OpenCvDetector.prototype.init = function() {
        var self = this;
        if (this.initialized) {
            return Promise.resolve();
        }
        return fetch(this.cascadeUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load face cascade model');
                }
                return response.arrayBuffer();
            })
            .then(function(buffer) {
                var cascadePath = '/face_cascade.xml';
                try {
                    cv.FS_unlink(cascadePath);
                } catch (e) {
                    // File did not exist yet.
                }
                cv.FS_createDataFile('/', 'face_cascade.xml', new Uint8Array(buffer), true, false, false);
                self.faceClassifier = new cv.CascadeClassifier();
                if (!self.faceClassifier.load(cascadePath)) {
                    throw new Error('Failed to load face cascade model into OpenCV');
                }
                self.qrDetector = new cv.QRCodeDetector();
                self.initialized = true;
            });
    };

    OpenCvDetector.prototype.processFrame = function(srcMat, detectorType, sensorPixelHeight) {
        if (detectorType === 'raw_feed') {
            return;
        }
        if (detectorType === 'face') {
            this._processFace(srcMat, sensorPixelHeight);
        } else if (detectorType === 'qr_code') {
            this._processQr(srcMat, sensorPixelHeight);
        }
    };

    OpenCvDetector.prototype._processFace = function(srcMat, sensorPixelHeight) {
        var gray = new cv.Mat();
        cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
        var faces = new cv.RectVector();
        this.faceClassifier.detectMultiScale(gray, faces, 1.3, 4, 0, new cv.Size(30, 30));

        if (faces.size() > 0) {
            var face = faces.get(0);
            var dist = distanceToFace(estimateEyePixelDist(face), sensorPixelHeight);
            drawDistanceInfo(srcMat, dist, estimateEyeCoord(face));
            drawFaceRect(srcMat, face);
        }

        gray.delete();
        faces.delete();
    };

    OpenCvDetector.prototype._processQr = function(srcMat, sensorPixelHeight) {
        var gray = new cv.Mat();
        cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
        var points = new cv.Mat();
        this.qrDetector.detect(gray, points);

        if (!points.empty() && points.rows >= 4) {
            var corners = matCornersFromQrPoints(points);
            if (isValidQrBbox(corners)) {
                drawDistanceInfo(srcMat, distanceToQr(qrPixelHeight(corners), sensorPixelHeight), corners[0]);
                drawQrBbox(srcMat, corners);
            }
        }

        gray.delete();
        points.delete();
    };

    OpenCvDetector.prototype.destroy = function() {
        if (this.faceClassifier) {
            this.faceClassifier.delete();
            this.faceClassifier = null;
        }
        if (this.qrDetector) {
            this.qrDetector.delete();
            this.qrDetector = null;
        }
        this.initialized = false;
    };

    // --- UI / webcam loop ---

    function changeDetectorType(detectorType) {
        headerSelected('#' + detectorType, '#header-div2');
        selected_detector_type = detectorType;
        $('#button-control').show();
    }

    function loadOpenCvScript() {
        if (opencvReady) {
            return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
            if (typeof cv !== 'undefined' && cv.Mat) {
                opencvReady = true;
                resolve();
                return;
            }
            var script = document.createElement('script');
            script.src = OPENCV_JS_URL;
            script.async = true;
            script.onload = function() {
                cv.onRuntimeInitialized = function() {
                    opencvReady = true;
                    resolve();
                };
            };
            script.onerror = function() {
                reject(new Error('Failed to load OpenCV.js'));
            };
            document.head.appendChild(script);
        });
    }

    function runDetectionLoop() {
        var ctx = captureCanvas.getContext('2d', { willReadFrequently: true });
        captureCanvas.width = videoEl.videoWidth;
        captureCanvas.height = videoEl.videoHeight;
        outputCanvas.width = videoEl.videoWidth;
        outputCanvas.height = videoEl.videoHeight;

        function frame() {
            if (!mediaStream) {
                return;
            }
            ctx.drawImage(videoEl, 0, 0, captureCanvas.width, captureCanvas.height);
            var srcMat = cv.imread(captureCanvas);
            detector.processFrame(srcMat, selected_detector_type, captureCanvas.height);
            cv.imshow(outputCanvas, srcMat);
            srcMat.delete();
            animationFrameId = requestAnimationFrame(frame);
        }

        animationFrameId = requestAnimationFrame(frame);
    }

    function stopRecording() {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        if (mediaStream) {
            mediaStream.getTracks().forEach(function(track) { track.stop(); });
            mediaStream = null;
        }

        if (videoEl) {
            videoEl.srcObject = null;
        }

        if (detector) {
            detector.destroy();
            detector = null;
        }

        $('#startBtn').show().prop('disabled', false).text('Start Detecting');
        $('#vidsContainer').hide();
    }

    function startRecording() {
        if (!selected_detector_type) {
            alert('Choose a detector type first.');
            return;
        }

        $('#startBtn').text('Loading OpenCV...').prop('disabled', true);

        loadOpenCvScript()
            .then(function() {
                $('#startBtn').text('Starting camera...');
                return navigator.mediaDevices.getUserMedia(mediaConstraints);
            })
            .then(function(stream) {
                mediaStream = stream;
                videoEl = document.getElementById('inputFeedVid');
                captureCanvas = document.getElementById('captureCanvas');
                outputCanvas = document.getElementById('outputFeedCanvas');
                videoEl.srcObject = stream;
                return videoEl.play();
            })
            .then(function() {
                detector = new OpenCvDetector(CASCADE_URL);
                return detector.init();
            })
            .then(function() {
                $('#vidsContainer').css('display', 'flex');
                $('#startBtn').hide().text('Start Detecting').prop('disabled', false);
                runDetectionLoop();
            })
            .catch(function(err) {
                alert(err);
                console.error(err);
                stopRecording();
            });
    }

    function bindWebcamRulerControls() {
        $('#header-div2 .detector-option').on('click', function() {
            changeDetectorType(this.dataset.detector);
        });
        $('#startBtn').on('click', startRecording);
        $('#stopBtn').on('click', stopRecording);
    }

    $(document).ready(bindWebcamRulerControls);
})();
