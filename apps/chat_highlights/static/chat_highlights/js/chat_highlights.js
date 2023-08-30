// this script uses https://observablehq.com/@d3/realtime-horizon-chart as a base

function genHighlightChart(chart_div_id, data) {
    url = data.url;
    youtube_id = data.youtube_id;
    lol_timestamps = [data.lol_ts];
    lol_ts_arr =  lol_timestamps[0].map(a => a.timestamp);
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
    var zoomedX = x;

    value_domain = d3.extent(lol_timestamps[0], (d) => d.value);
    var y = d3.scaleLinear()
                .domain(value_domain)
                .rangeRound([0, -bands * graph_heights]);

    var color = d3.scaleLinear().domain([0, bands-1]).range(["orange", "white"])

    // Create the container and append a canvas for each series.
    const div = d3.select(chart_div_id).style("position", "relative");

    var canvas = div.selectAll("canvas")
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
        drawHighlights(d, context, x);
    }

    function drawHighlights(data, context, _xAxis) {
        const {length: k} = data;
        context.fillStyle = "#333";
        context.fillRect(0, 0, width, graph_heights);
        const second_width = 5.1 * width/data.length;
        for (let i = 0; i < bands; ++i) {
            context.save();
            context.translate(0, i * graph_heights);
            context.fillStyle = color(i);
            for (let j = 0; j < k; ++j) {
                const timestamp = new Date(data[j].timestamp);
                context.fillRect(_xAxis(timestamp), graph_heights, second_width, y(data[j].value));
            }
            context.restore();
        }
    }

    // Create a SVG container for the axis and the interaction.
    var svg = div.append("svg")
        .attr("width", width)
        .attr("height", height+ 20)
        .style("position", "relative")
        .style("font", "10px sans-serif");

    var xAxis = d3.axisBottom(x).tickFormat((d) => d.toISOString().slice(11, 19)).tickSizeOuter(0)

    var gX = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)

    // Create the y axis.
    svg.append("g")
        .selectAll("text")
        .data(lol_timestamps)
        .join("text")
            .attr("x", 4)
            .attr("y", 10)
            .attr("dy", "0.35em")
            .attr("fill", "orange")
            .attr('font-size', "2em")
            .text( "LOL Geiger Counter" );

    // Create a moving rule that follows the mouse.
    const rule = svg.append("line")
        .attr("stroke", "orange")
        .attr("y1", marginTop)
        .attr("y2", height + marginTop)
        .attr("x1", 0.5)
        .attr("x2", 0.5);

    const rule_ts = svg.append("g").append('text')
        .attr("x", .6)
        .attr("y", marginTop + 5)
        .attr("dy", "0.35em")
        .attr("fill", "orange")
        .attr('font-size', "1em")
        .text( "Timestamp" );

    const rule_val = svg.append("g").append('text')
        .attr('text-anchor', 'end')
        .attr("x", .4)
        .attr("y", marginTop + 5)
        .attr("dy", "0.35em")
        .attr("fill", "orange")
        .attr('font-size', "1em")
        .text( "Value" );

    svg.on("mousemove touchmove", (event) => {
        const xx = d3.pointer(event, svg.node())[0] + 0.5;
        timestamp = Math.round(zoomedX.invert(xx)/1000);

        timestamp_str = new Date(timestamp * 1000).toISOString().substring(11, 19);
        rule.attr("x1", xx).attr("x2", xx);

        rule_ts.attr("x", xx + 5).text(timestamp_str);

        i = d3.bisectCenter(lol_ts_arr, timestamp * 1000);
        val = lol_timestamps[0][i].value
        rule_val.attr("x", xx - 5).text(val);
    });

    svg.on("mouseup touchend", (event) => {
        const xx = d3.pointer(event, svg.node())[0] + 0.5;
        timestamp = Math.round(zoomedX.invert(xx)/1000);

        if (player !== null) {
            player.seekTo(timestamp, true);
        } else {
            timestamped_url = url + '&t=' + timestamp;
            window.open(timestamped_url, "_blank");
        }
    });

    var zoom = d3.zoom()
        .scaleExtent([1, 5])
        .extent([[0, 0], [width, height]])
        .filter(preventDefaultZoomBehavior)
        .on("zoom", zoomBehavior);

    function preventDefaultZoomBehavior(event) {
        event.preventDefault()
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    }

    zoomRect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
        .call(zoom);

    function zoomBehavior({ transform }) {
        zoomRect.attr("transform", transform);
        zoomedX = transform.rescaleX(x);
        gX.call(xAxis.scale(zoomedX));
        context = canvas.node().getContext("2d");
        drawHighlights(lol_timestamps[0], context, zoomedX);
    }

    return div.node();
}