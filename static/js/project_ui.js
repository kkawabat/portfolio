function showProjectContent(name) {
    closeAboutPanel();
    $('#content-div').children('[id^="content-"]').hide();
    $('#content-div').show();
    $('#content-' + name).show();
    $('#header-div1 .project-mode-btn').removeClass('active');
    $('#header-' + name).addClass('active');
    history.pushState({}, '', name);
}

function openAboutPanel() {
    $('#project-about-overlay').addClass('open').attr('aria-hidden', 'false');
}

function closeAboutPanel() {
    $('#project-about-overlay').removeClass('open').attr('aria-hidden', 'true');
}

function initProjectPage(defaultContent, anchor) {
    $('#project-about-btn').on('click', openAboutPanel);
    $('#project-about-overlay').on('click', function(e) {
        if (e.target === this) {
            closeAboutPanel();
        }
    });
    $('.project-about-close').on('click', closeAboutPanel);
    $('.project-about-dialog').on('click', function(e) {
        e.stopPropagation();
    });
    $(document).on('keydown.projectAbout', function(e) {
        if (e.key === 'Escape') {
            closeAboutPanel();
        }
    });

    if (anchor === 'details') {
        openAboutPanel();
    } else if (anchor) {
        showProjectContent(anchor);
    } else {
        showProjectContent(defaultContent);
    }
}
