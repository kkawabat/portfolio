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
    $('#seconds').html(seconds);
    $('#tens').html(tens);
}

function incrementTimer () {
    tens++;

    if(tens <= 9){ $('#tens').html( "0" + tens); }
    if(tens > 9){ $('#tens').html(tens);}

    if (tens > 99) {
        seconds++;
        $('#seconds').html("0" + seconds);
        tens = 0;
        $('#tens').html("0" + 0);
    }

    if (seconds > 9){ $('#seconds').html(seconds); }
}
