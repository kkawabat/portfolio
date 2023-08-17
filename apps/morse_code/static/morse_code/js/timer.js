var Interval ;
var seconds = 00;
var tens = 00;

// https://codepen.io/cathydutton/pen/xxpOOw
function startTimer() {
     clearInterval(Interval);
     Interval = setInterval(incrementTimer, 10);
}

function stopTimer(){
    clearInterval(Interval);
}

function resetTimer(){
    clearInterval(Interval);
    tens = "00";
  	seconds = "00";
    $('#appendSeconds').html(seconds);
    $('#appendTens').html(tens);
}

function incrementTimer () {
    tens++;

    if(tens <= 9){ $('#appendTens').html( "0" + tens); }
    if(tens > 9){ $('#appendTens').html(tens);}

    if (tens > 99) {
        seconds++;
        $('#appendSeconds').html("0" + seconds);
        tens = 0;
        $('#appendTens').html("0" + 0);
    }

    if (seconds > 9){ $('#appendSeconds').html(seconds); }
}
