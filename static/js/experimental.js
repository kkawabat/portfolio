// this function returns the url path if linked from a different part of the website
function get_referrer(){
    var parts = document.referrer.split('://');
    if (document.referrer.split('://').length != 1){
        var protocol = parts[0];
        var host = parts[1].split('/')[0];
        var pathName = parts.slice(1).join('/');
        if (host === window.location.host) {
            return pathName
        }
    }
    return none;
}