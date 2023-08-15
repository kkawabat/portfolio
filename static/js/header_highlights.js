function headerSelected(evt, headerClass) {
    $(headerClass).children('h3').each(function() {
        // ensure all header-div1 headers are in deactivated state
        $(this).removeClass('active').addClass('deactive');
    })
    $("#" +  evt.currentTarget.id).removeClass('deactive').addClass('active');
}