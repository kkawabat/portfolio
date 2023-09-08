function startRecording() {
    audioRecorder.start();
}


function stopRecording() {
    audioRecorder.stop()
        .then(audioBlob => { transcribe(audioBlob); });
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
        error: function (request, status, error) { console.log('failed'); }
    });
}

function process_response(response) {
    if ('error' in response) {
        alert(response['error']);
    } else {

    }
}