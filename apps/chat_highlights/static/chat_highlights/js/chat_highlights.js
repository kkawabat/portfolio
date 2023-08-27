// this script uses https://observablehq.com/@d3/realtime-horizon-chart as a base

function genHighlightChart(chart_div_id, data) {
    url = data.url;
    lol_timestamps = [data.lol_ts];
    total_stream_duration = data.total_duration;

    // Specify the chart’s dimensions.
    const marginTop = 30;
    const marginRight = 10;
    const marginBottom = 0;
    const marginLeft = 10;
    const graph_heights = 100;
    const bands = 3;
    const width = 600;
    const height = lol_timestamps.length * (graph_heights + 1) + marginTop + marginBottom;

    // Create the scales.
    timestamp_domain = d3.extent(lol_timestamps[0], s=> new Date(s.timestamp));
    const x = d3.scaleTime().domain(timestamp_domain).range([0, width]);
    const y = d3.scaleLinear().rangeRound([0, -bands * graph_heights]);

    //  const color =  i => d3.schemeOranges[Math.max(3, bands)][i + Math.max(0, 3 - bands)];
    var color = d3.scaleLinear().domain([0, bands-1]).range(["#333", "orange"])

    // Create the container and append a canvas for each series.
    const div = d3.select(chart_div_id).style("position", "relative");

    const canvas = div.selectAll("canvas")
        .data(lol_timestamps)
        .enter().append("canvas")
            .attr("width", width)
            .attr("height", height)
            .style("position", "absolute")
            .style("image-rendering", "pixelated")
            .style("top", (d, i) => `${i * (graph_heights + 1) + marginTop}px`)
            .property("context", function() { return this.getContext("2d"); })
            .each(horizon);

    // Create a SVG container for the axis and the interaction.
    const svg = div.append("svg")
        .attr("width", width)
        .attr("height", height + marginTop)
        .style("position", "relative")
        .style("font", "10px sans-serif");

    // Create a container for the axis.
    const gX = svg.append("g")
        .attr("transform", `translate(0,${marginTop})`);

    function HHMMSS_timestamp(date){
        // https://stackoverflow.com/a/25279340/4231985
        return date.toISOString().slice(11, 19);
    }

    gX.call(d3.axisTop(x).tickFormat(HHMMSS_timestamp).tickSizeOuter(0))
       .call(g => g.selectAll(".tick").filter(d => {
            return x(d) < marginLeft || x(d) >= width - marginRight;
       }).remove())
       .call(g => g.select(".domain").remove());

    // Create the y axis.
    svg.append("g")
        .selectAll("text")
        .data(lol_timestamps)
        .join("text")
            .attr("x", 4)
            .attr("y", (d, i) => (i + 0.5) * (graph_heights + 1) + marginTop)
            .attr("dy", "0.35em")
            .text( (d, i) => { return i; } );

    // Create a moving rule that follows the mouse.
    const rule = svg.append("line")
        .attr("stroke", "#000")
        .attr("y1", marginTop)
        .attr("y2", height + marginTop)
        .attr("x1", 0.5)
        .attr("x2", 0.5);

    svg.on("mousemove touchmove", (event) => {
        const xx = d3.pointer(event, svg.node())[0] + 0.5;
        rule.attr("x1", xx).attr("x2", xx);
        timestamp = x.invert(xx);
    });

    svg.on("mouseup touchend", (event) => {
        const xx = d3.pointer(event, svg.node())[0] + 0.5;
        timestamp = x.invert(xx);
        timestamped_url = url + '&t=' + Math.round(timestamp);
        window.open(timestamped_url, "_blank");
        console.log(timestamped_url);
    });

    // This function draws each band in turn. There is no need to clip, since we’re working on a canvas.
    function horizon(d) {
        const {context} = this;
        const {length: k} = d;
//        if (k < width) context.drawImage(this, k, 0, width - k, step, 0, 0, width - k, step);
        context.fillStyle = "#333";
        context.fillRect(0, 0, width, graph_heights);
        const second_width = width/d.length;

        for (let i = 0; i < bands; ++i) {
            context.save();
            context.translate(0, (i + 1) * graph_heights);
            context.fillStyle = color(i);
            for (let j = 0; j < k; ++j) {
                const timestamp = new Date(d[j].timestamp);
                context.fillRect(x(timestamp), y(d[j].value), second_width, -y(d[j].value));
            }
            context.restore();
        }
    }

    return div.node();
}