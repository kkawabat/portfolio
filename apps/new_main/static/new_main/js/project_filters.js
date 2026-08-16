(function ($) {
    var HASH_TO_TAG = {
        games: 'game',
        game: 'game',
        visual: 'visual',
        audio: 'audio',
        text: 'text'
    };

    function selectedTags() {
        return $('#project-filters .project-filter-btn.active')
            .map(function () { return $(this).attr('data-tag'); })
            .get()
            .filter(Boolean);
    }

    function setPressed($btn, on) {
        $btn.toggleClass('active', on).attr('aria-pressed', on ? 'true' : 'false');
    }

    function setAllActive() {
        setPressed($('#project-filters .project-filter-btn'), false);
        setPressed($('#project-filter-all'), true);
    }

    function applyFilter() {
        var tags = selectedTags();
        var showAll = $('#project-filter-all').hasClass('active') || tags.length === 0;
        $('#content-projects .project-card').each(function () {
            var cardTags = ($(this).attr('data-tags') || '').trim().split(/\s+/);
            var match = showAll || tags.some(function (tag) {
                return cardTags.indexOf(tag) !== -1;
            });
            $(this).toggle(match);
        });
    }

    function selectTags(tagIds) {
        if (!tagIds.length) {
            setAllActive();
            applyFilter();
            return;
        }
        setPressed($('#project-filter-all'), false);
        $('#project-filters .project-filter-btn[data-tag]').each(function () {
            var on = tagIds.indexOf($(this).attr('data-tag')) !== -1;
            setPressed($(this), on);
        });
        applyFilter();
    }

    $(function () {
        if (!$('#project-filters').length) {
            return;
        }

        $('#project-filters').on('click', '.project-filter-btn', function () {
            var tag = $(this).attr('data-tag');
            if (!tag) {
                setAllActive();
                applyFilter();
                return;
            }
            setPressed($('#project-filter-all'), false);
            setPressed($(this), !$(this).hasClass('active'));
            if (!selectedTags().length) {
                setAllActive();
            }
            applyFilter();
        });

        var hash = (window.location.hash || '').replace('#', '');
        if (HASH_TO_TAG[hash]) {
            selectTags([HASH_TO_TAG[hash]]);
        }
    });
})(jQuery);
