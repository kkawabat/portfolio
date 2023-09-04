let morseSocket;
let morse_signal;
let down_time;
let up_time;
let prompt_list = ["I am counting my calories yet I really want dessert",
"I do not respect anybody who can not tell the difference between Pepsi and Coke",
"I was starting to worry that my pet turtle could tell what I was thinking",
"Facing his greatest fear he ate his first marshmallow",
"She looked at the masterpiece hanging in the museum but all she could think is that her five year old could do better",
"Beach combing replaced wine tasting as his new obsession",
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
"The rusty nail stood erect angled at a five degree angle just waiting for the perfect barefoot to come along",
"A suit of armor provides excellent sun protection on hot days",
"My dentist tells me that chewing bricks is very bad for your teeth",
"I want to buy a onesie but know it wont suit me",
"Greetings from the real universe",
"At that moment she realized she had a sixth sense",
"The golden retriever loved the fireworks each Fourth of July"];
let selected_prompt;
let transcribed_prompt;


function update_prompt(decoded_text) {
    matched_str = "";
    matched_str_span = "";
    unmatched_str = selected_prompt;
    i = 0;
    err = false;
    while (i < decoded_text.length){
        if (unmatched_str.length == 0){ break; }
        else if (decoded_text[i] === unmatched_str[0]) {
            matched_str +=  decoded_text[i]
            if (err) { matched_str_span += '<span class="red">' + decoded_text[i] + '</span>'; }
            else { matched_str_span += '<span class="green">' + decoded_text[i] + '</span>'; }
            unmatched_str = unmatched_str.slice(1);
            err = false;
        }
        else { err = true; }
        i++;
    }

    transcribed_prompt = '<span class="green">' + matched_str + '</span>'
    if (err){ transcribed_prompt += '<span class="red">' + decoded_text[decoded_text.length - 1] + '</span>'; }
    $('#transcribed-prompt').html(transcribed_prompt);
    $('#prompt').html(matched_str_span + unmatched_str);

    if (unmatched_str.length === 0){
        stopTimer();
        stopTone();  // stops the beep if pressed twice
        total_duration = (seconds + (tens/100)).toFixed(3);
        alert("you did it! \n" +
            "total time: " + total_duration + "\n" +
            "tapping rate: " + (selected_prompt.length/total_duration).toFixed(3) + " characters per second\n" +
            "error rate: " + (((decoded_text.length-selected_prompt.length)/selected_prompt.length)*100).toFixed(1)) + "%";
    }
}

function SpeedTestStartMorseRecording() {
    $('#Speedtap-start-control').hide();
    $('#Speedtap-stop-control').show();
    $('#Speedtap-stop-control')[0].scrollIntoView(false);
    $('#STTapBtn').mousedown(btn_down_handler);
    $('#STTapBtn').mouseup(btn_up_handler);
    startTimer();
    morse_signal = [];
    random_prompt_idx = ~~(Math.random() * prompt_list.length);
    selected_prompt = prompt_list[random_prompt_idx].replace(/[^A-Za-z ]/g, '').toLowerCase();
    $('#prompt').text(selected_prompt);
    $('#transcribed-prompt').text('');
    $('#transcribed-prompt-div').height($('#prompt-div').height());
    up_time = Date.now();
    document.addEventListener('keydown', down_handler);
    document.addEventListener('keyup', up_handler);
    startBeeper();
    window.scrollTo(0, document.body.scrollHeight);
}

function SpeedTestStopMorseRecording() {
    $('#Speedtap-start-control').show();
    $('#Speedtap-stop-control').hide();
    resetTimer();
    $('#STTapBtn').unbind("mousedown");
    $('#STTapBtn').unbind("mouseup");
    document.removeEventListener('keydown', down_handler);
    document.removeEventListener('keyup', up_handler);
    $('#STMorse').text("");
    $('#STText').text("");
    stopTone();
}

function down_handler(e) {
    if (e.repeat) { return }
    if (e.key === " ") {
        down_behavior();
    }
};

function up_handler(e) {
    if (e.key === " ") {
        up_behavior();
    }
};

function btn_down_handler(e) {
    e.preventDefault();
    if (e.repeat) { return; }
    down_behavior();

};

function btn_up_handler(e) {
    up_behavior();
};

function down_behavior(){
    startTone();
    down_time = Date.now();
    morse_signal.push( Math.round((down_time - up_time)/10) );
    parse_signal(morse_signal);
}

function up_behavior(){
    stopTone();
    up_time = Date.now();
    morse_signal.push( Math.round((up_time - down_time)/10) );
    parse_signal(morse_signal);
}


const tappingSpeed = 20;
const shortDurationThreshold = tappingSpeed;
const shortPauseDurationThreshold = tappingSpeed * 1;
const longPauseDurationThreshold = tappingSpeed * 4;

const CHAR_TO_MORSE_MAP = {'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.',
                           'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.',
                           'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-',
                           'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..',
                           '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
                           '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/', '':''};

const MORSE_TO_CHAR_MAP = Object.fromEntries(Object.entries(CHAR_TO_MORSE_MAP).map(([key, value]) => [value, key]));

function parse_signal(signal_durations) {
    const morse = signal_to_morse(signal_durations);
    const morse_text = morse_to_text(morse);
    result = {'morse': morse, 'text': morse_text}

    $('#STMorse').text(result['morse']);
    $('#STText').text(result['text']);
    update_prompt(result['text']);
}

function signal_to_morse(signal_durations) {
    const up_signals = signal_durations.filter((element, index) => {return index % 2 === 0;})
    const down_signals = signal_durations.filter((element, index) => {return index % 2 === 1;})
    const up = up_signals.map((dur) => {
        if (dur <= shortPauseDurationThreshold) { return ""; }
        else if (dur <= longPauseDurationThreshold) { return " "; }
        else { return " / "; }
    });

    const down = down_signals.map((dur) => {
        if (dur <= shortDurationThreshold) { return "."; }
        else { return "-"; }
    });

    morse_str = up.flatMap((up_val, idx) => [up_val, down[idx]]).join('')
    return morse_str
}

function morse_to_text(morse_str) {
    morse_text = morse_str.trim().split(" ").map((v) => (v in MORSE_TO_CHAR_MAP) ? MORSE_TO_CHAR_MAP[v]: '�');
    return morse_text
}

function text_to_morse(text) {
    morse = morse.map((v) => (v in CHAR_TO_MORSE_MAP) ? CHAR_TO_MORSE_MAP[v]: '').join(' ');
    return morse
}