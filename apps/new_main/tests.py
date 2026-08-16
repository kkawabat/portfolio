from datetime import datetime

from django.test import TestCase
from django.urls import reverse

from .projects_config import (
    format_blog_date_display,
    get_blogs,
    get_project_tags,
    get_projects,
    parse_blog_dates,
    strip_blog_date_lines,
)


class ProjectTagTests(TestCase):
    def test_every_project_has_tags(self):
        for project in get_projects():
            self.assertTrue(project.get('tags'), msg=project['title'])

    def test_filter_buttons_are_the_known_set(self):
        self.assertEqual(
            [tag['id'] for tag in get_project_tags()],
            ['game', 'visual', 'audio', 'text'],
        )

    def test_projects_can_have_multiple_tags(self):
        transcriber = next(p for p in get_projects() if p['slug'] == 'speech-transcriber')
        self.assertEqual(set(transcriber['tags']), {'audio', 'text'})

    def test_projects_page_has_filters_and_tagged_cards(self):
        response = self.client.get(reverse('projects'))
        self.assertContains(response, 'id="project-filters"')
        self.assertContains(response, 'data-tag="game"')
        self.assertContains(response, 'data-tags="game visual"')
        self.assertContains(response, 'Tilt Breakout')
        self.assertContains(response, 'Voice Stripper')
        self.assertNotContains(response, 'Other projects')


class BlogPostTests(TestCase):
    def test_readme_is_not_a_blog(self):
        slugs = [blog['slug'] for blog in get_blogs()]
        self.assertNotIn('readme', slugs)

    def test_created_only_date_line(self):
        dates = parse_blog_dates('| Aug 15, 2026\n\n# Title\n\nHello.\n')
        self.assertEqual(dates['created'], datetime(2026, 8, 15))
        self.assertIsNone(dates['updated'])
        self.assertEqual(format_blog_date_display(dates), 'Aug 15, 2026')

    def test_created_and_updated_date_lines(self):
        dates = parse_blog_dates(
            '| Aug 16, 2026\n| updated Aug 20, 2026\n\n# Title\n\nHello.\n'
        )
        self.assertEqual(dates['created'], datetime(2026, 8, 16))
        self.assertEqual(dates['updated'], datetime(2026, 8, 20))
        self.assertEqual(
            format_blog_date_display(dates),
            'Aug 16, 2026 · updated Aug 20, 2026',
        )

    def test_date_lines_are_stripped_from_the_body(self):
        body = strip_blog_date_lines(
            '| Aug 16, 2026\n| updated Aug 20, 2026\n\n# Title\n\nHello.\n'
        )
        self.assertEqual(body, '# Title\n\nHello.\n')

    def test_later_table_rows_are_not_dates(self):
        dates = parse_blog_dates(
            '| Aug 16, 2026\n\n# Title\n\n| Jan 1, 2020 | not a date |\n'
        )
        self.assertEqual(dates['created'], datetime(2026, 8, 16))
        self.assertIsNone(dates['updated'])

    def test_existing_posts_have_created_dates_and_no_updated(self):
        blogs = {blog['slug']: blog for blog in get_blogs()}
        birth = blogs['chewy-thoughts-birth-rate-is-a-leisure-problem']
        self.assertEqual(birth['date'], datetime(2026, 8, 15))
        self.assertNotIn('updated', birth)

    def test_hybrid_post_is_listed_with_created_date(self):
        blogs = {blog['slug']: blog for blog in get_blogs()}
        hybrid = blogs['chewy-thoughts-hybrid-cars-are-not-stepping-stones']
        self.assertEqual(
            hybrid['title'],
            'Chewy thoughts: hybrid cars are not stepping stones',
        )
        self.assertEqual(hybrid['date'], datetime(2026, 8, 16))
        self.assertNotIn('updated', hybrid)

    def test_birth_rate_post_page_shows_created_date(self):
        response = self.client.get(
            reverse('blog_post', args=['chewy-thoughts-birth-rate-is-a-leisure-problem'])
        )
        self.assertContains(response, '| Aug 15, 2026')
        self.assertNotContains(response, 'updated')
        self.assertNotContains(response, 'README')
