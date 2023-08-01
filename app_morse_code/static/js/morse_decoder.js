let morseSocket;
let morse_signal;
let down_time;
let up_time;

function startMorseRecording() {
    $('#startBtn').hide();
    $('#recordingIcon').show();
    $('#stopBtn').show();
    connectSocket();
    morse_signal = "";
    up_time = Date.now();
    document.addEventListener('keydown', down_handler);
    document.addEventListener('keyup', up_handler);
}


function stopMorseRecording() {
    $('#startBtn').show()
    $('#recordingIcon').hide()
    $('#stopBtn').hide()
    disconnectSocket()
    document.removeEventListener('keydown', down_handler)
    document.removeEventListener('keyup', up_handler)
}


function send_data(morse_signal){
    morseSocket.send(JSON.stringify({type: 'decode', data: morse_signal}));
//    console.log(morse_signal)
}


function down_handler(e) {
    if (e.repeat) { return }
    if (e.key === " ") {
        down_time = Date.now()
        morse_signal += Math.round((down_time - up_time)/10).toString() + 'U';
        send_data(morse_signal)
    }
};

function up_handler(e) {
    if (e.key === " ") {
        up_time = Date.now()
        morse_signal += Math.round((up_time - down_time)/10).toString() + 'D';
        send_data(morse_signal)
    }
};

function connectSocket() {
    let ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    console.log(ws_scheme);

    morseSocket = new WebSocket(
        ws_scheme
        + window.location.host
        + '/ws/morse/'
    );

    morseSocket.onmessage = (response) =>{
        result = JSON.parse(response.data)
        if ('disconnected' in result){
            stopMorseRecording()
        }
        else{
            $('#decodedMorse').text(result['morse'])
            $('#decodedText').text(result['text'])
        }
    }
}

function disconnectSocket() {
    morseSocket.onclose = function () {};
    morseSocket.close();
}

//  from https://stackoverflow.com/a/8809472/4231985
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}