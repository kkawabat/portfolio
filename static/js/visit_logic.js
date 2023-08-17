// this function returns the url path if linked from a different part of the website
function get_referrer(){
    var parts = document.referrer.split('://');
    if (document.referrer.split('://').length != 1){
        var protocol = parts[0];
        var parts = parts[1].split('/');
        var host = parts[0]
        var pathName = parts.slice(1).join('/');
    }
    return [host, pathName];
}

function isFirstVisit() {
    if (localStorage.getItem('was_visited')) { return false; }
    localStorage.setItem('was_visited', 1);
    return true;
}
