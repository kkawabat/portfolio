function select_nav(name, headerClass){
    var header_id = "#header-" + name;
    if ($(header_id).hasClass('active')) {
        return;
    }
    headerSelected(header_id, headerClass)

    ContentSelection("#content-" +  name, true)
    history.pushState({}, "", name)
}

function headerSelected(header_id, headerClass) {
    $(headerClass + ' ' + '.header').each(function() { $(this).removeClass('active').addClass('deactive'); })
    $(header_id).removeClass('deactive').addClass('active');
}

function ContentSelectionHideAll() {
    $('#content-div').children().each(function() { $(this).hide() })
}
function ContentSelection(content_div_id, animate) {
    ContentSelectionHideAll();
    $('#content-div').show();
    var $panel = $(content_div_id);
    if (animate) {
        $panel.removeClass('fade-in-top');
        void $panel[0].offsetWidth;
        $panel.addClass('fade-in-top');
    }
    $panel.show();
}