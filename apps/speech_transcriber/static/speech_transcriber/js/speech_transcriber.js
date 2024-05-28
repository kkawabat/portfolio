var wavesurfer = null;
var wsRegions = null;


function recording_state(){
    $("#startBtn").hide();
    $("#stopBtn").show();
    $("#loading_div").hide();
}

function loading_state(){
    $("#startBtn").hide();
    $("#stopBtn").hide();
    $("#loading_div").show();
}

function start_state(){
    $("#startBtn").show();
    $("#stopBtn").hide();
    $("#loading_div").hide();
}


function finished_state(){
    $("#startBtn").hide();
    $("#stopBtn").hide();
    $("#loading_div").hide();
}

function startRecording() {
    audioRecorder.start();
    recording_state();
}


function stopRecording() {
    audioRecorder.stop().then(audioBlob => {
        transcribe(audioBlob);
        load_waveform(URL.createObjectURL(audioBlob));
    });
    loading_state();
}

$('#submitForm').on( "submit", function( event ) {
    event.preventDefault();
    audio_file = $( this ).find( "input[name='audioFile']" )[0].files[0]
    transcribe(audioBlob);

});

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
        success: function(response) {
            if ('error' in response) {
                alert(response['error']);
                start_state();
                return;
            }
            display_transcribed_view(response, audioBlob);
        },
        error: function (request, status, error) { console.log('failed ' + error); }
    });
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

function sampleRun(){
    sample_transcript =
    sample_audio =
    display_transcribed_view(transcript, audio)
}

function displayTranscribedView(transcript, audio) {
    finished_state();
    load_waveform(URL.createObjectURL(audioBlob));
    load_ws_region(transcript['word_items']);
    $("#transcript-div").html(transcript['transcript_view']);
}