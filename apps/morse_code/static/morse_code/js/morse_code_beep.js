//WARNING: VERY LOUD.  TURN DOWN YOUR SPEAKERS BEFORE TESTING
// code modified from https://stackoverflow.com/a/39987136/4231985
var audioCtx;
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const word_list = ['about', 'all', 'also', 'and', 'because', 'but', 'can', 'come', 'could', 'day', 'even', 'find', 'first', 'for', 'from', 'get', 'give', 'have', 'her', 'here', 'him', 'his', 'how', 'into', 'its', 'just', 'know', 'like', 'look', 'make', 'man', 'many', 'more', 'new', 'not', 'now', 'one', 'only', 'other', 'our', 'out', 'people', 'say', 'see', 'she', 'some', 'take', 'tell', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'think', 'this', 'those', 'time', 'two', 'use', 'very', 'want', 'way', 'well', 'what', 'when', 'which', 'who', 'will', 'with', 'would', 'year', 'you', 'your'];
const sentence_list = [
        'Yes, I live in this house over here.',
        'It’s getting dark.',
        'She hoped she wasn\'t about to get fired.',
        'Her grandmother gave her the bracelet.',
        'He does laundry in his basement.',
        'I didn\'t know that was an option.',
        'Robert tends to talk big.',
        'She swims every morning.',
        'Naps are good for you.',
        'Have you opened the door?'
];

function startBeeper(){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 550; // value in hertz
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = .1;
    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();
    audioCtx.suspend();
}


function startTone() {
    if (audioCtx.state == 'suspended'){ audioCtx.resume(); }
}

function stopTone() {
    if (audioCtx.state == 'running'){ audioCtx.suspend(); }
}

var prompt = null;

function answer(){
    answer_text = $("#answerTextbox").val().replace(/[^A-Za-z ]/g, '').toLowerCase()
    if (prompt == answer_text){
        alert('You got it correct!')
    } else {
        alert('Wrong answer! it was ' + prompt)
    }
}

function PlayMorse(play_again){
    if (play_again & prompt != null) {
        PlayMorseSound(prompt);
    }
    else {
        prompt = getPrompt();
        PlayMorseSound(prompt);
    }
}

function getPrompt(){
    promptType =  $('input:radio[name=morse_difficulty]:checked').val();
    console.log(promptType);
    switch (promptType){
        case 'letters':
            return alphabet[~~(Math.random() * alphabet.length)];
            break;
        case 'words':
            return word_list[~~(Math.random() * word_list.length)];
            break;
        case 'sentences':
            return sentence_list[~~(Math.random() * sentence_list.length)].replace(/[^A-Za-z ]/g, '').toLowerCase();
            break;
    }
}

function PlayMorseSound(input_string) {
    morseArray = string_to_morse_array(input_string)

    beep_chain = Promise.resolve();
    morseArray.forEach((beep_type) => {
        beep_chain = beep_chain.then(()=>play_beep(beep_type))
    });
    beep_chain = beep_chain.then(()=>play_beep('end'));
    return beep_chain;
}

char_to_morse = new Map();
char_to_morse.set('a', '.-');
char_to_morse.set('b', '-...');
char_to_morse.set('c', '-.-.');
char_to_morse.set('d', '-..');
char_to_morse.set('e', '.');
char_to_morse.set('f', '..-.');
char_to_morse.set('g', '--.');
char_to_morse.set('h', '....');
char_to_morse.set('i', '..');
char_to_morse.set('j', '.---');
char_to_morse.set('k', '-.-');
char_to_morse.set('l', '.-..');
char_to_morse.set('m', '--');
char_to_morse.set('n', '-.');
char_to_morse.set('o', '---');
char_to_morse.set('p', '.--.');
char_to_morse.set('q', '--.-');
char_to_morse.set('r', '.-.');
char_to_morse.set('s', '...');
char_to_morse.set('t', '-');
char_to_morse.set('u', '..-');
char_to_morse.set('v', '...-');
char_to_morse.set('w', '.--');
char_to_morse.set('x', '-..-');
char_to_morse.set('y', '-.--');
char_to_morse.set('z', '--..');
char_to_morse.set('0', '-----');
char_to_morse.set('1', '.----');
char_to_morse.set('2', '..---');
char_to_morse.set('3', '...--');
char_to_morse.set('4', '....-');
char_to_morse.set('5', '.....');
char_to_morse.set('6', '-....');
char_to_morse.set('7', '--...');
char_to_morse.set('8', '---..');
char_to_morse.set('9', '----.');
char_to_morse.set(' ', '/');


function string_to_morse_array(input_string) {
    console.log(input_string);
    morseArray = [];
    input_string.toLowerCase().split('').forEach((char) => {
        if (char_to_morse.has(char)) { morse = char_to_morse.get(char) + ' '; }
        else { morse = '/'; }
        morse.split('').forEach((morse_char) => {
            switch(morse_char) {
                case '.':
                    morseArray.push('dit');
                    break;
                case '-':
                    morseArray.push('dah');
                    break;
                case ' ':
                    morseArray.push('pause');
                    break;
                case '/':
                    morseArray.push('long_pause');
                    break;
                default:
                    console.log('unexpected morse_char found while parsing string');
            }
        })
    })
    console.log(morseArray);
    return morseArray;
}

function play_beep(beep_type){
    console.log(beep_type);
    switch(beep_type) {
        case 'dit':
            return new Promise(r => { audioCtx.resume(); r(); })
                        .then(r => { setTimeout( function(){ audioCtx.suspend(); }, 200); } )
                        .then(pause(400));
            break;
        case 'dah':
            return new Promise(r => { audioCtx.resume(); r();})
                        .then(r => { setTimeout(() => { audioCtx.suspend(); }, 400); } )
                        .then(pause(400));
            break;
        case 'pause':
            return new Promise(r => setTimeout(r, 200));
            break;
        case 'long_pause':
            return new Promise(r => setTimeout(r, 800));
            break;
        default:
            return audioCtx.suspend();
    }
}

function pause(ms) {
    return function(x) {
        return new Promise(resolve => setTimeout(() => resolve(x), ms));
    };
}