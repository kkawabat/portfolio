function startMorseRecording() {
    $('#startBtn').hide()
    $('#recordingIcon').show()
    $('#stopBtn').show()
}

function stopMorseRecording() {
    $('#startBtn').show()
    $('#recordingIcon').hide()
    $('#stopBtn').hide()
}