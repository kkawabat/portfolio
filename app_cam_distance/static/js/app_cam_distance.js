
let video = document.getElementById("vidElement");

let video_codec = 'VP8';
let pc = null;

let media_constraints = { audio: false, video: { width: 320, height: 240 };


function startRecording(){
    $("#startBtn").hide()
    $("#stopBtn").show()
    $("#recordingIcon").show()

    media_stream = navigator.mediaDevices
                        .getUserMedia(media_constraints)
                        .then((stream) => {
                            video.srcObject = stream;
                            video.addEventListener("loadedmetadata", () => { video.play();});
                            return stream;
                        })
                        .catch(alert);

    init_webrtc(pc, media_stream, '/cam_distance_signaling')
}

function stopRecording(){
    $("#startBtn").show()
    $("#stopBtn").hide()
    $("#recordingIcon").hide()

    video.srcObject.getTracks().forEach((track) => { track.stop(); });
    video.srcObject = null;
    disconnect_webrtc(pc)
}