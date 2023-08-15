if (typeof audioCtx  === 'undefined'){
    var Interval ;
    var seconds = 00;
    var tens = 00;
    var appendSeconds = document.getElementById('seconds');
    var appendTens = document.getElementById('tens');
}

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
    appendTens.innerHTML = tens;
  	appendSeconds.innerHTML = seconds;
}

function incrementTimer () {
    tens++;

    if(tens <= 9){ appendTens.innerHTML = "0" + tens; }
    if(tens > 9){ appendTens.innerHTML = tens; }

    if (tens > 99) {
        console.log("seconds");
        seconds++;
        appendSeconds.innerHTML = "0" + seconds;
        tens = 0;
        appendTens.innerHTML = "0" + 0;
    }

    if (seconds > 9){ appendSeconds.innerHTML = seconds; }
}
