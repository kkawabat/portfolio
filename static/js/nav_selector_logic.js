function select_nav(name, headerClass){
    headerSelected("#header-" +  name, headerClass)

    ContentSelection("#content-" +  name)
    history.pushState({}, "", name)
}

function headerSelected(header_id, headerClass) {
    $(headerClass + ' ' + '.header').each(function() { $(this).removeClass('active').addClass('deactive'); })
    $(header_id).removeClass('deactive').addClass('active');
}

function ContentSelectionHideAll() {
    $('#content-div').children().each(function() { $(this).hide() })
}
function ContentSelection(content_div_id) {
    ContentSelectionHideAll();
    $('#content-div').show();
    $(content_div_id).show();
}