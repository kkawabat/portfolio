var eliza
var chat_history
var svg, main_g;
var Tooltip

$(document).ready(function() {
    eliza = new ElizaBot();
    chat_history = [];
    Tooltip = d3.select("#analysis-result-div")
            .append("div")
            .attr("class", "tooltip")
    document.getElementById("chat-btn").addEventListener("click", send_msg);
    document.getElementById("reset-btn").addEventListener("click", reset);
    document.getElementById("analyze-btn").addEventListener("click", analyze);
    document.getElementById("analyze2-btn").addEventListener("click", analyze);
    svg = d3.select("#analysis-result-div").append("svg")
    reset()
});


function send_msg(){
    var inputstring = document.getElementById('dialog-txt').value
    if (inputstring == ""){return;}
    var reply = eliza.transform(inputstring);
    chat_history.push(inputstring);
    $('#transcript-txt').val($('#transcript-txt').val() + "\nYou: " + inputstring + "\nEliza: " + reply);
    $('#transcript-txt').scrollTop($textarea[0].scrollHeight);
}

function reset(){
    eliza.reset()
    chat_history = [];
    $('#transcript-txt').val("Eliza: " + eliza.getInitial());
    $('#analysis-result-div').hide()
}

function analyze(event){
    event.preventDefault();
    var data;
    if (event.srcElement.id == 'analyze-btn'){
        data = chat_history
    }else if (event.srcElement.id == 'analyze2-btn'){
        // from https://stackoverflow.com/a/4163827
        var raw_data = $("#PasteBin").val().split('\n')
        data = [];
        for (i in raw_data){
            if (raw_data[i].trim() != ''){
                data.push(raw_data[i].trim())
            }
        }
    }


    var csrf_token = $('#csrf_token').val();
    fetch("analyze", {
        headers: {
            "X-CSRFToken": csrf_token,
            'Content-Type': 'application/json'
        },
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify(data),
    }).then((response) => response.json()
    ).then((data) => {
        display_sentiment_results(data)
    });
}


function display_sentiment_results(raw_data){

    data = raw_data.sentiment_results

    $('#analysis-result-div').show()
    var margin = {top: 30, right: 10, bottom: 10, left: 60},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var num_turns = data.length /3

    var y = d3.scaleLinear()
        .domain([-1, 1])
        .range([height, 0])
        .nice();

    var x_bandwidth = width/num_turns /2
    var x = d3.scaleBand()
        .domain(d3.range(0, num_turns, 1))
        .range([0, width])

    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    svg.selectAll('*').remove()
    main_g = svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    main_g.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("fill", function(d) {
            if (d.label == 'neg'){
                return 'steelblue'
            }
            else if (d.label == 'neu'){
                return 'grey'
            }
            else {
                return 'red'
            }
        })
        .attr('stroke-width', 3)
        .attr("y", function(d) {
            return y(d.position)
        })
        .attr("x", function(d, i) { return x(d.turn)+ x_bandwidth/2; })
        .attr("height", function(d) { return y(0)-y(d.value) })
        .attr("width", x_bandwidth)
        .on("mouseover", onover)
        .on("mousemove", onmove)
        .on("mouseleave", onleave)

    var yAxis = d3.axisLeft(y)
    main_g.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var xAxis = d3.axisBottom(x)
                  .ticks(num_turns)
                  .tickValues(d3.range(0, num_turns, 1) )
    main_g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " +  (height/2) + ")")
        .call(xAxis);

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle ")
    .attr('fill', 'white')
    .attr("y", 6)
    .attr("x", -height/2)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("sentiment score");

    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr('fill', 'white')
    .attr("x", width + 10)
    .attr("y", height/2 + 20)
    .text("turn #");
    console.log(data)
}


var onover = function(e, d) {
        Tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("opacity", 1)
    }
var onmove = function(e, d) {
    if (d.label == "neg"){
        var prefix = "[<span style='color: blue;'>NEGATIVE</span> " + d.value.toFixed(2) + "] "
    }else if (d.label == 'pos'){
        var prefix = "[<span style='color: red;'>POSITIVE</span> " + d.value.toFixed(2) + "] "
    }else {
        var prefix = "[<span style='color: grey;'>NEUTRAL</span> " + d.value.toFixed(2) + "] "
    }
    Tooltip
        .html(prefix + d.text)
        .style("left", (d3.pointer(this)[0]+70) + "px")
        .style("top", (d3.pointer(this)[1]) + "px")
}
var onleave = function(e, d) {
    d3.select(this)
        .style("opacity", 0.8)
}

//I had a wonderful time yesterday at my birthday.
//I saw Jason for the first time in months, it was a fun time.
//I wish James could have been there with us though.
//I miss him dearly.
//He would have enjoyed it.
//The food was wonderful, I loved Marry's casserole.
//I tried to follow her recipe once but it just doesn't taste the same.
//Fred and Joe got into an argument but they resolved it pretty quick.
//Sometimes I can't tell if they are friends or enemies, haha.