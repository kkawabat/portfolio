function select_nav(name, headerClass){
    headerSelected(name, headerClass)

    ContentSelection(name)
    history.pushState({}, "", name)
}

function headerSelected(name, headerClass) {
    $(headerClass).children().each(function() { $(this).removeClass('active').addClass('deactive'); })
    $("#header-" +  name).removeClass('deactive').addClass('active');
}

function ContentSelectionHideAll() {
    $('#content-div').children().each(function() { $(this).hide() })
}
function ContentSelection(name) {
    ContentSelectionHideAll();
    $("#content-" +  name).show();
}