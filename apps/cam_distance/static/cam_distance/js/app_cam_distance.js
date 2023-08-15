var input_track = null;
var output_feed_vid = document.getElementById("outputFeedVid");
var video_codec = 'VP8';
var webrtc_obj = null;

var media_constraints = { audio: false, video: { width: 320, height: 240 }};

var signalingSocket = null;


$(document).ready(function() {
    $('input:radio[name=measure_type]').change(function() {
        if (signalingSocket != null){
            detector_change_request = JSON.stringify({ detector_type: this.value })
            signalingSocket.send(detector_change_request);
        }
    });
});


function startRecording(){
    $("#startBtn").hide()
    $("#stopBtn").show()
    $("#recordingIcon").show()
    $('#vidsContainer').css('display', 'flex')

    var ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    var cam_signaling_ws_endpoint = ws_scheme + window.location.host + '/ws/cam_distance_signaling/'
    signalingSocket = new WebSocket( cam_signaling_ws_endpoint )
    navigator.mediaDevices
        .getUserMedia(media_constraints)
        .then((input_media_stream) => {
            input_track = input_media_stream;
            output_feed_vid.addEventListener("loadedmetadata", () => { output_feed_vid.play();});
            webrtc_obj = init_webrtc(input_media_stream, signalingSocket, output_feed_vid)
            detector_change_request = JSON.stringify({ detector_type: $('input[name="measure_type"]:checked').val() })
            signalingSocket.send(detector_change_request);
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
    $('#vidsContainer').css('display', 'none')

    input_track.getTracks().forEach((track) => { track.stop(); });
    output_feed_vid.srcObject.getTracks().forEach((track) => { track.stop(); });
    output_feed_vid.srcObject = null;
    signalingSocket.close()
    signalingSocket = null;
    if (webrtc_obj != null){ disconnect_webrtc(pc); }
}