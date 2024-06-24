$(document).ready(function() {
    $("#strip-btn").on("click", strip_vocal);
});


function strip_vocal(){
    var vid_url = $("#youtube-link").val()
    var match = vid_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/);
    if (match === null){
        alert('link isn\'t a youtube video');
        return;
    }

    var csrf_token = $('#csrf_token').val();
    fetch("strip", {
        headers: {
            "X-CSRFToken": csrf_token,
            'Content-Type': 'application/json'
        },
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({'vid_url': $("#youtube-link").val()}),
    }).then((response) => response.json()
    ).then((data) => {
        data['test']
    });
}