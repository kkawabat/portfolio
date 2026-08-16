from django.test import TestCase
from django.urls import reverse

from .projects_config import get_projects, get_project_tags


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
