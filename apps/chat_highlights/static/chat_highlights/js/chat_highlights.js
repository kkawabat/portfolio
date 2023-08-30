// this script uses https://observablehq.com/@d3/realtime-horizon-chart as a base

function genHighlightChart(chart_div_id, data) {
    url = data.url;
    youtube_id = data.youtube_id;
    lol_timestamps = [data.lol_ts];
    total_stream_duration = data.total_duration;

    // Specify the chart’s dimensions.
    const marginTop = 30;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 10;
    const graph_heights = 100;
    const bands = 4;
    const width = 600;
    const height = lol_timestamps.length * (graph_heights) + marginTop + marginBottom;

    // Create the scales.
    timestamp_domain = [new Date(0), new Date(lol_timestamps[0][lol_timestamps[0].length-1].timestamp)];
    const x = d3.scaleTime().domain(timestamp_domain).range([0, width]);

    value_domain = d3.extent(lol_timestamps[0], (d) => d.value);
    const y = d3.scaleLinear()
                .domain(value_domain)
                .rangeRound([0, -bands * graph_heights]);

    var color = d3.scaleLinear().domain([0, bands-1]).range(["orange", "white"])
//    color = i =>["rgb(12,25,67)", "rgb(72,0,67)", "rgb(72,90,0)"][i]

    // Create the container and append a canvas for each series.
    const div = d3.select(chart_div_id).style("position", "relative");

    const canvas = div.selectAll("canvas")
        .data(lol_timestamps)
        .enter().append("canvas")
            .attr("width", width)
            .attr("height", graph_heights)
            .style("position", "absolute")
            .style("image-rendering", "pixelated")
            .style("top", (d, i) => `${i * (graph_heights + 1) + marginTop + marginBottom}px`)
            .property("context", function() { return this.getContext("2d"); })
            .each(horizon);

    // This function draws each band in turn. There is no need to clip, since we’re working on a canvas.
    function horizon(d) {
        const {context} = this;
        const {length: k} = d;
        context.fillStyle = "#333";
        context.fillRect(0, 0, width, graph_heights);
        const second_width = 10*width/d.length;

        for (let i = 0; i < bands; ++i) {
            context.save();
            context.translate(0, i * graph_heights);
            context.fillStyle = color(i);
            for (let j = 0; j < k; ++j) {
                const timestamp = new Date(d[j].timestamp);
                context.fillRect(x(timestamp), graph_heights, second_width, y(d[j].value));
            }
            context.restore();
        }
    }

    // Create a SVG container for the axis and the interaction.
    const svg = div.append("svg")
        .attr("width", width)
        .attr("height", height+ 20)
        .style("position", "relative")
        .style("font", "10px sans-serif");

    // Create a container for the axis.
    const gX = svg.append("g")
        .attr("transform", `translate(0, ${height })`)
        .call(d3.axisBottom(x).tickFormat(HHMMSS_timestamp).tickSizeOuter(0))

    function HHMMSS_timestamp(date){
        // https://stackoverflow.com/a/25279340/4231985
        return date.toISOString().slice(11, 19);
    }

    // Create the y axis.
    svg.append("g")
        .selectAll("text")
        .data(lol_timestamps)
        .join("text")
            .attr("x", 4)
            .attr("y", marginTop)
            .attr("dy", "0.35em")
            .attr("fill", "orange")
            .attr('font-size', "2em")
            .text( "LOL Geiger Counter" );

    // Create a moving rule that follows the mouse.
    const rule = svg.append("line")
        .attr("stroke", "orange")
        .attr("y1", 0)
        .attr("y2", height + marginTop)
        .attr("x1", 0.5)
        .attr("x2", 0.5);

    svg.on("mousemove touchmove", (event) => {
        const xx = d3.pointer(event, svg.node())[0] + 0.5;
        rule.attr("x1", xx).attr("x2", xx);
    });

    svg.on("mouseup touchend", (event) => {
        const xx = d3.pointer(event, svg.node())[0] + 0.5;
        timestamp = x.invert(xx)/1000;

        if (player !== null) {
            player.seekTo(Math.round(timestamp), true);
        } else {
            timestamped_url = url + '&t=' + Math.round(timestamp);
            window.open(timestamped_url, "_blank");
        }


    });

    return div.node();
}