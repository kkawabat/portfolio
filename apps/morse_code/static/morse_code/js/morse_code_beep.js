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
var prompt = null;
var morse_difficulty = null;
var beep_chain = null;
var end_beep_early = false;
var beep_in_progress = false;

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


function answer(){
    answer_text = $("#answerTextbox").val().replace(/[^A-Za-z ]/g, '').toLowerCase()
    if (prompt == answer_text){
        alert('You got it correct!')
    } else {
        alert('Wrong answer! it was ' + prompt)
    }
}

function PlayMorse(play_again){
    if (audioCtx == null)
        startBeeper();

    if (play_again & prompt != null) {
        PlayMorseSound(prompt);
    }
    else {
        prompt = getPrompt();
        PlayMorseSound(prompt);
    }
}

function change_difficulty(difficulty) {
    headerSelected("#" + difficulty, '#header-div2');
    morse_difficulty = difficulty;
    $('#Practice-start-control').show()
    window.scrollTo(0, document.body.scrollHeight);
}


function getPrompt(){
    switch (morse_difficulty){
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
    return morseArray;
}

function StopMorseSound(input_string) {
    end_beep_early = true;
}

function PlayMorseSound(input_string) {
    morseArray = string_to_morse_array(input_string);
    if (beep_in_progress){
        end_beep_early = true;
    }
    beep_in_progress = true;
    beep_chain = Promise.resolve();
    morseArray.forEach((beep_type) => {
        beep_chain = beep_chain.then(()=>{
            if (end_beep_early) {
                end_beep_early = false;
                throw Error('ending prematurely')
            }
            return play_beep(beep_type);
        })
    });
    beep_chain = beep_chain.then(()=>play_beep('end')).catch((e) => console.log(e)).finally(() => { beep_in_progress=false; } );
    return beep_chain;
}

function play_beep(beep_type){
    console.log(beep_type);
    switch(beep_type) {
        case 'dit':
            return beep(200).then(unbeep_promise(200));
            break;
        case 'dah':
            return beep(400).then(unbeep_promise(200));
            break;
        case 'pause':
            return pause(400);
            break;
        case 'long_pause':
            return pause(800);
            break;
        default:
            return audioCtx.suspend();
    }
}

function beep(ms) {
    return audioCtx.resume().then(pause_promise(ms))
}

function beep_promise(ms) {
    return () => { return beep(ms) };
}

function unbeep(ms) {
    return audioCtx.suspend().then(pause_promise(ms))
}

function unbeep_promise(ms) {
    return () => { return unbeep(ms) };
}

function pause(ms) {
    return new Promise((r) => setTimeout(() => r(), ms));
}

function pause_promise(ms) {
    return () => { return pause(ms) };
}