let morseSocket;
let morse_signal;
let down_time;
let up_time;
let start;
let prompt_list = ["I am counting my calories yet I really want dessert",
"I do not respect anybody who can not tell the difference between Pepsi and Coke",
"I was starting to worry that my pet turtle could tell what I was thinking",
"Facing his greatest fear he ate his first marshmallow",
"She looked at the masterpiece hanging in the museum but all she could think is that her five year old could do better",
"Beach-combing replaced wine tasting as his new obsession",
"The truth is that you pay for your lifestyle in hours",
"He wore the surgical mask in public not to keep from catching a virus but to keep people away from him",
"When motorists sped in and out of traffic all she could think of was those in need of a transplant",
"Getting up at dawn is for the birds",
"The book is in front of the table",
"Three years later the coffin was still full of Jello",
"Green should have smelled more tranquil but somehow it just tasted rotten",
"Two more days and all his problems would be solved",
"He knew it was going to be a bad day when he saw mountain lions roaming the streets",
"The green tea and avocado smoothie turned out exactly as would be expected",
"Joe discovered that traffic cones make excellent megaphones",
"The efficiency with which he paired the socks in the drawer was quite admirable",
"He was surprised that his immense laziness was inspirational to others",
"The Tsunami wave crashed against the raised houses and broke the pilings as if they were toothpicks",
"Even with the snow falling outside she felt it appropriate to wear her bikini",
"I only enjoy window shopping when the windows are transparent",
"People who insist on picking their teeth with their elbows are so annoying",
"He wondered if it could be called a beach if there was no sand",
"The doll spun around in circles in hopes of coming alive",
"She did a happy dance because all of the socks from the dryer matched",
"The door swung open to reveal pink giraffes and red elephants",
"You have no right to call yourself creative until you look at a trowel and think that it would make a great lockpick",
"It was at that moment that he learned there are certain parts of the body that you should never Nair",
"He dreamed of leaving his law firm to open a portable dog wash",
"I honestly find her about as intimidating as a basket of kittens",
"The toy brought back fond memories of being lost in the rain forest",
"The fish dreamed of escaping the fishbowl and into the toilet where he saw his friend go",
"The delicious aroma from the kitchen was ruined by cigarette smoke",
"Nobody questions who built the pyramids in Mexico",
"Siri became confused when we reused to follow her directions",
"The rusty nail stood erect angled at a 45 degree angle just waiting for the perfect barefoot to come along",
"A suit of armor provides excellent sun protection on hot days",
"My dentist tells me that chewing bricks is very bad for your teeth",
"I want to buy a onesie but know it won’t suit me",
"Greetings from the real universe",
"At that moment she realized she had a sixth sense",
"The golden retriever loved the fireworks each Fourth of July"];
let selected_prompt;
let prompt_span = document.querySelector('#prompt');



function speedtest_on_message_handler(){
    $('#STMorse').text(result['morse']);
    $('#STText').text(result['text']);
    update_prompt(result['text']);
}

function update_prompt(decoded_text){
    matched_str = "";
    unmatched_str = selected_prompt;
    err = false;
    i = 0;
    while (i < decoded_text.length) {
        if (unmatched_str.length == 0){
            break;
        }

        if (!!unmatched_str[0].match(/^[.,:!?']/)){
            matched_str += unmatched_str[0];
            unmatched_str = unmatched_str.slice(1);
        }

        if (unmatched_str[0] === decoded_text[i]){
            matched_str += decoded_text[i];
            unmatched_str = unmatched_str.slice(1);
            err = false;
        } else {
            err = true; }
        i++;
    }

    if (err){
        prompt_span.innerHTML = '<span class="green">' + matched_str + '</span>' + '<span class="red">' + unmatched_str[0] + '</span>' + unmatched_str.slice(1);
    } else {
        prompt_span.innerHTML = '<span class="green">' + matched_str + '</span>' + unmatched_str;
    }

    if (unmatched_str.length === 0){
        stopTimer();
        total_duration = (seconds + (tens/100)).toFixed(3);
        alert("you did it! \n" +
            "total time: " + total_duration + "\n" +
            "tapping rate: " + (selected_prompt.length/total_duration).toFixed(3) + " characters per second\n" +
            "error rate: " + (((decoded_text.length-selected_prompt.length)/selected_prompt.length)*100).toFixed(1)) + "%";
    }
}

function SpeedTestStartMorseRecording() {
    window.scrollTo(0, document.body.scrollHeight);
    $('#Speedtap-start-control').hide();
    $('#Speedtap-stop-control').show();
    $('#STTapBtn').mousedown(btn_down_handler);
    $('#STTapBtn').mouseup(btn_up_handler);
    startTimer();
    connectSocket(speedtest_on_message_handler);
    morse_signal = "";
    random_prompt_idx = Math.floor(Math.random() * prompt_list.length);
    selected_prompt = prompt_list[random_prompt_idx].toLowerCase();
    prompt_span.textContent = selected_prompt;
    up_time = Date.now();
    document.addEventListener('keydown', down_handler);
    document.addEventListener('keyup', up_handler);
}


function SpeedTestStopMorseRecording() {
    $('#Speedtap-start-control').show();
    $('#Speedtap-stop-control').hide();
    resetTimer();
    disconnectSocket();
    $('#STTapBtn').unbind("mousedown");
    $('#STTapBtn').unbind("mouseup");
    document.removeEventListener('keydown', down_handler);
    document.removeEventListener('keyup', up_handler);
    $('#STMorse').text("");
    $('#STText').text("");
}

function practice_on_message_handler(){
    $('#PMorse').text(result['morse']);
    $('#PText').text(result['text']);
}

function PracticeStartMorseRecording() {
    $('#Practice-start-control').hide();
    $('#Practice-stop-control').show();
    $('#PTapBtn').mousedown(btn_down_handler);
    $('#PTapBtn').mouseup(btn_up_handler);
    connectSocket(practice_on_message_handler);
    morse_signal = "";
    up_time = Date.now();
    document.addEventListener('keydown', down_handler);
    document.addEventListener('keyup', up_handler);
}


function PracticeStopMorseRecording() {
    $('#Practice-start-control').show();
    $('#Practice-stop-control').hide();
    $('#STTapBtn').unbind("mousedown");
    $('#STTapBtn').unbind("mouseup");
    disconnectSocket();
    document.removeEventListener('keydown', down_handler);
    document.removeEventListener('keyup', up_handler);
}


function down_handler(e) {
    if (e.repeat) { return }
    if (e.key === " ") {
        down_time = Date.now();
        morse_signal += Math.round((down_time - up_time)/10).toString() + 'U';
        send_data(morse_signal);
    }
};

function up_handler(e) {
    if (e.key === " ") {
        up_time = Date.now();
        morse_signal += Math.round((up_time - down_time)/10).toString() + 'D';
        send_data(morse_signal);
    }
};

function btn_down_handler(e) {
    e.preventDefault();
    if (e.repeat) { return; }
    down_time = Date.now();
    morse_signal += Math.round((down_time - up_time)/10).toString() + 'U';
    send_data(morse_signal);
};

function btn_up_handler(e) {
    up_time = Date.now();
    morse_signal += Math.round((up_time - down_time)/10).toString() + 'D';
    send_data(morse_signal);
};


function send_data(morse_signal){
    morseSocket.send(JSON.stringify({type: 'decode', data: morse_signal}));
//    console.log(morse_signal);
}


function connectSocket(on_message_handler) {
    let ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    console.log(ws_scheme);

    morseSocket = new WebSocket( ws_scheme + window.location.host + '/ws/morse/' );

    morseSocket.onmessage = (response) =>{
        result = JSON.parse(response.data);
        if ('disconnected' in result){
            stopMorseRecording();
        }
        else{
            on_message_handler(); }
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

