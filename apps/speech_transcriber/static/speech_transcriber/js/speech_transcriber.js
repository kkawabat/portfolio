var wavesurfer = null;
var wsRegions = null;

function startRecording() {
    audioRecorder.start();
    $("#startBtn").hide();
    $("#stopBtn").show();
}


function stopRecording() {
    audioRecorder.stop().then(audioBlob => {
        transcribe(audioBlob);
        load_waveform(URL.createObjectURL(audioBlob));
    });
    $("#startBtn").show();
    $("#stopBtn").hide();
}

function transcribe(audioBlob){
    var csrf_token = $('#csrf_token').val();

    var formData = new FormData();
    formData.append('csrfmiddlewaretoken', csrf_token);
    formData.append('audioBlob', audioBlob);

    $.ajax({
        url: 'submit',
        type: 'POST',
        dataType: "json",
        data: formData,
        enctype: 'multipart/form-data',
        cache: false,
        processData: false,
        contentType: false,
        success: function(response) {process_response(response); },
        error: function (request, status, error) { console.log('failed ' + error); }
    });
}


function process_response(response) {
    if ('error' in response) {
        alert(response['error']);
        return;
    }
    load_ws_region(response['word_items']);
    $("#transcript-div").html(response['transcript_view']);
}

function load_waveform(audio_uri) {
    if (wavesurfer !== null){
        wavesurfer.destroy();
    }

    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'orange',
        progressColor: '#c57f00',
        url: audio_uri
    });

    wavesurfer.on('interaction', () => { wavesurfer.play() })
}

function load_ws_region(word_items){
    wsRegions = wavesurfer.registerPlugin(new WaveSurfer.Regions());

    for (item of word_items) {
        if (item.type === "pronunciation") {
            wsRegions.addRegion({
                start: item.start, end: item.end,
                content: item.text,
                color: 'rgb(255, 165, 0, .5)',
                drag: false, resize: false
            });
        }
    }
}

function seek(time) {
    ws.setTime(time);
    ws.play();
}

function playRegion(idx) {
    wsRegions.regions[idx].play();
}