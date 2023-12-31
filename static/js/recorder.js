var audioRecorder = {
    audioBlobs: [],
    mediaRecorder: null,
    streamBeingCaptured: null,
    status: 'paused',
    start: function (deviceId = 'default') {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
        }

        constraints = {deviceId: {exact: deviceId},
                        autoGainControl: {ideal: false},
                        noiseSuppression: {ideal: false},
                        echoCancellation: {ideal: false}
                        }

        return navigator.mediaDevices.getUserMedia({ audio:  constraints})
            .then(stream => {
                audioRecorder.streamBeingCaptured = stream;
                audioRecorder.mediaRecorder = new MediaRecorder(stream);
                audioRecorder.audioBlobs = [];

                audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                    audioRecorder.audioBlobs.push(event.data);
                });

                audioRecorder.mediaRecorder.start();
                audioRecorder.status = 'started';
            });
    },
    stop: function () {
        return new Promise(resolve => {
            let mimeType = audioRecorder.mediaRecorder.mimeType;
            audioRecorder.mediaRecorder.addEventListener("stop", () => {
                let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType });
                resolve(audioBlob);
            });
            audioRecorder.cancel();
        });
    },
    cancel: function () {
        audioRecorder.mediaRecorder.stop();
        audioRecorder.stopStream();
        audioRecorder.resetRecordingProperties();
        audioRecorder.status = 'paused';
    },
    stopStream: function() {
        audioRecorder.streamBeingCaptured.getTracks().forEach(track => track.stop());
    },
    resetRecordingProperties: function () {
        audioRecorder.mediaRecorder = null;
        audioRecorder.streamBeingCaptured = null;
    }
}