function startAudioRecording() {
    $('#startBtn').hide()
    $('#recordingIcon').show()
    $('#stopBtn').show()
    $('#cancelBtn').show()

    audioRecorder.start()
        .then(() => {
            console.log("recorder started");
        })
        .catch(error => {
            if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                console.log("To record audio, use browsers like Chrome and Firefox.");
            }
            else{
                console.log(error.message)
            }
        });
}


function stopAudioRecording() {
    $('#startBtn').show()
    $('#recordingIcon').hide()
    $('#stopBtn').hide()
    $('#cancelBtn').hide()
    audioRecorder.stop().then(audioBlob => {
        loadAudio(audioBlob);
        submitWhistleBlob(audioBlob);
    });
}

function cancelAudioRecording() {
    $('#startBtn').show()
    $('#recordingIcon').hide()
    $('#stopBtn').hide()
    $('#cancelBtn').hide()
    audioRecorder.cancel();
}


function loadAudio(audioBlob) {

    let reader = new FileReader();
    reader.onload = (e) => {
        $("#playbackDiv").attr("hidden", false);
        let audioElement = $("#audioControl")[0];
        let audioElementSource = $("#audioSrc")[0];
        let base64URL = e.target.result;

        audioElementSource.src = base64URL;
        let BlobType = audioBlob.type.includes(";") ?
            audioBlob.type.substr(0, audioBlob.type.indexOf(';')) : audioBlob.type;
        audioElementSource.type = BlobType
        audioElement.load();
        console.log("Playing audio...");
        audioElement.play();
    };
    reader.readAsDataURL(audioBlob);
}

function submitWhistleBlob(audioBlob){
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
        success: function(response){
            if('error' in response){
                alert(response['error'])
            }
            else{
                console.log('success')
            }

        },
        error: function (request, status, error) {
            console.log('failed')
        }
    });
}
