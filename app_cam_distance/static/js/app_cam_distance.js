var cam_video = document.getElementById("vidElement");
var video_codec = 'VP8';
var webrtc_obj = null;

var media_constraints = { audio: false, video: { width: 320, height: 240 }};

var ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
var cam_signaling_ws_endpoint = ws_scheme + window.location.host + '/ws/cam_distance_signaling/'

function startRecording(){
    $("#startBtn").hide()
    $("#stopBtn").show()
    $("#recordingIcon").show()

    navigator.mediaDevices
        .getUserMedia(media_constraints)
        .then((media_stream) => {
            cam_video.srcObject = media_stream;
            cam_video.addEventListener("loadedmetadata", () => { cam_video.play();});
            webrtc_obj = init_webrtc(media_stream, cam_signaling_ws_endpoint)
        })
        .catch(err => {
            alert(err);
            console.error(err);
        });
}

function stopRecording(){
    $("#startBtn").show()
    $("#stopBtn").hide()
    $("#recordingIcon").hide()

    cam_video.srcObject.getTracks().forEach((track) => { track.stop(); });
    cam_video.srcObject = null;
    if (webrtc_obj != null){ disconnect_webrtc(pc); }

}