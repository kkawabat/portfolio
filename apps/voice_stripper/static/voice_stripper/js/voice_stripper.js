$(document).ready(function() {
    $("#strip-btn").on("click", strip_vocal);
});


function strip_vocal(event){
    var vid_url = $("#youtube-link").val()
    var match = vid_url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/);
    if (match === null){
        alert('link isn\'t a youtube video');
        return;
    }
    $("#strip-btn").text("Stripping...this might take a minute...")
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
        $("#strip-btn").text("Strip Vocal!")
        if ('error' in data){
            alert(data['error']);
            return;
        }
        var audio_data = data['audio_data']
        var audio = $('#stripped-audio')
        audio.attr("hidden",false);
        audio.attr("src", audio_data);
        audio[0].pause()
        audio[0].load()
        audio[0].oncanplaythrough = audio[0].play()
    });
}