"""
Simple configuration for portfolio projects and blogs.
Projects are static, blogs are automatically loaded from the blog_posts folder.
"""

import os
import re
from datetime import datetime
from django.conf import settings

# Simple project list.
# Entries with a 'url' field live outside this repo (e.g. GitHub Pages games
# under games.kankawabata.com); their cards link straight to that URL.
# Entries without one are Django apps in this repo, resolved via their slug.
# tags: a project may have several; the My Projects tab filters by union.
PROJECT_TAG_ORDER = ('game', 'visual', 'audio', 'text')
PROJECT_TAG_LABELS = {
    'game': 'Games',
    'visual': 'Visual',
    'audio': 'Audio',
    'text': 'Text',
}

PROJECTS = [
    {
        'title': 'Tilt Breakout',
        'description': 'Brick breaker steered by tilting your phone — device orientation drives the paddle.',
        'date': datetime(2026, 8, 9),
        'slug': 'tilt-breakout',
        'tags': ['game', 'visual'],
    },
    {
        'title': 'You Laugh You Lose',
        'description': 'Try not to laugh while watching a YouTube video — your webcam scores every break.',
        'date': datetime(2026, 8, 2),
        'slug': 'you-laugh-you-lose',
        'tags': ['game', 'visual'],
    },
    {
        'title': 'GameWork',
        'description': 'TypeScript framework for building multiplayer browser games, with live demos.',
        'date': datetime(2025, 9, 2),
        'slug': 'gamework',
        'url': 'https://games.kankawabata.com/gamework/',
        'tags': ['game'],
    },
    {
        'title': 'Poetry for Neanderthals',
        'description': 'Team word-guessing game where poets may only speak in single syllables.',
        'date': datetime(2025, 8, 30),
        'slug': 'poetry-for-neanderthals',
        'url': 'https://games.kankawabata.com/poetry_for_neanderthals/',
        'tags': ['game', 'text'],
    },
    {
        'title': 'Monikers',
        'description': 'Mobile-friendly party word game for two teams, with pre-built decks and custom cards.',
        'date': datetime(2025, 8, 17),
        'slug': 'moniker',
        'url': 'https://games.kankawabata.com/Moniker/',
        'tags': ['game', 'text'],
    },
    {
        'title': 'Mora Jai Box',
        'description': 'Simulator for the Mora Jai puzzle boxes found in Blue Prince.',
        'date': datetime(2025, 5, 11),
        'slug': 'mora-jai-box',
        'url': 'https://games.kankawabata.com/MoraJaiBox/',
        'tags': ['game', 'visual'],
    },
    {
        'title': 'Voice Stripper',
        'description': 'Remove vocals from audio tracks using audio processing.',
        'date': datetime(2024, 6, 23),
        'slug': 'voice-stripper',
        'tags': ['audio'],
    },
    {
        'title': 'ELIZA Parser',
        'description': 'Modern web implementation of the classic ELIZA chatbot.',
        'date': datetime(2024, 5, 29),
        'slug': 'eliza-parser',
        'tags': ['text'],
    },
    {
        'title': 'Speech Transcriber',
        'description': 'Web-based speech-to-text with audio visualization and editing.',
        'date': datetime(2023, 9, 4),
        'slug': 'speech-transcriber',
        'tags': ['audio', 'text'],
    },
    {
        'title': 'Chat Highlights Parser',
        'description': 'Parse chat logs to extract highlights and interesting moments.',
        'date': datetime(2023, 8, 20),
        'slug': 'chat-highlights',
        'tags': ['text'],
    },
    {
        'title': 'Web Soundboard',
        'description': 'Interactive soundboard for playing sound effects and music clips.',
        'date': datetime(2023, 8, 19),
        'slug': 'web-soundboard',
        'tags': ['audio'],
    },
    {
        'title': 'Webcam Ruler',
        'description': 'Measure objects using your webcam with computer vision.',
        'date': datetime(2023, 8, 15),
        'slug': 'webcam-ruler',
        'tags': ['visual'],
    },
    {
        'title': 'Whistle Detector',
        'description': 'Machine learning application that detects whistle sounds in audio recordings.',
        'date': datetime(2023, 8, 13),
        'slug': 'whistle-detector',
        'tags': ['audio'],
    },
    {
        'title': 'Magic Eye Generator',
        'description': 'Create Magic Eye (autostereogram) images interactively.',
        'date': datetime(2022, 1, 1),
        'slug': 'magic-eye-app',
        'tags': ['visual'],
    },
    {
        'title': 'Morse Code Translator',
        'description': 'Morse code translator with audio generation and learning tools.',
        'date': datetime(2020, 1, 1),
        'slug': 'morse-code-app',
        'tags': ['audio', 'text'],
    },
]

def get_projects():
    """Get all projects, newest first."""
    return sorted(PROJECTS, key=lambda x: x.get('date', datetime.min), reverse=True)


def get_project_tags():
    """Filter buttons for the projects tab, in display order, omitting unused tags."""
    used = {tag for project in PROJECTS for tag in project.get('tags', [])}
    return [
        {'id': tag, 'label': PROJECT_TAG_LABELS[tag]}
        for tag in PROJECT_TAG_ORDER
        if tag in used
    ]

def get_blog_posts_dir():
    """Folder of markdown blog posts at the repo root."""
    return os.path.join(settings.BASE_DIR, 'blog_posts')

_MONTH_DAY_YEAR = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}'
_CREATED_DATE_LINE = re.compile(rf'^\|\s*(?:created\s+)?({_MONTH_DAY_YEAR})\s*$', re.IGNORECASE)
_UPDATED_DATE_LINE = re.compile(rf'^\|\s*updated\s+({_MONTH_DAY_YEAR})\s*$', re.IGNORECASE)


def parse_blog_dates(content):
    """Read leading `| Mon D, YYYY` / `| updated Mon D, YYYY` lines.

    Stops at the first non-blank, non-date line so table rows later in the
    post are not treated as metadata. `date`/`created_str` is the created date.
    """
    created_str = None
    updated_str = None
    for line in content.splitlines():
        text = line.strip()
        if not text:
            continue
        updated_match = _UPDATED_DATE_LINE.match(text)
        if updated_match:
            updated_str = updated_match.group(1)
            continue
        created_match = _CREATED_DATE_LINE.match(text)
        if created_match:
            if created_str is None:
                created_str = created_match.group(1)
            continue
        break
    return {
        'created': _parse_month_day_year(created_str),
        'updated': _parse_month_day_year(updated_str),
        'created_str': created_str,
        'updated_str': updated_str,
    }


def strip_blog_date_lines(content):
    """Remove leading created/updated date lines (and blanks before the title)."""
    lines = content.splitlines(keepends=True)
    index = 0
    while index < len(lines):
        text = lines[index].strip()
        if not text or _UPDATED_DATE_LINE.match(text) or _CREATED_DATE_LINE.match(text):
            index += 1
            continue
        break
    return ''.join(lines[index:])


def format_blog_date_display(dates):
    """Post-page date line, without the leading `| ` the template adds."""
    created_str = dates.get('created_str')
    updated_str = dates.get('updated_str')
    if created_str and updated_str:
        return f'{created_str} · updated {updated_str}'
    return created_str or ''


def _parse_month_day_year(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%b %d, %Y')
    except ValueError:
        return None


def get_blogs():
    """Automatically load blogs from the blog_posts folder."""
    blogs = []
    blog_posts_dir = get_blog_posts_dir()

    if not os.path.exists(blog_posts_dir):
        return blogs

    for filename in os.listdir(blog_posts_dir):
        if not filename.endswith('.md'):
            continue
        if filename.lower() == 'readme.md':
            continue
        blog_info = _extract_blog_info(filename, blog_posts_dir)
        if blog_info:
            blogs.append(blog_info)

    # Sort by created date (newest first); edits should not reshuffle the grid
    return sorted(blogs, key=lambda x: x.get('date', datetime.min), reverse=True)

def _extract_description(content):
    """First real paragraph of the post, truncated for use as a card blurb."""
    for line in content.splitlines():
        text = line.strip()
        if not text or text.startswith('|') or text.startswith('#'):
            continue
        if len(text) > 150:
            text = text[:147].rstrip() + '...'
        return text
    return ''

def _extract_blog_info(filename, blog_posts_dir):
    """Extract title, slug, blurb, and dates from a markdown blog post."""
    file_path = os.path.join(blog_posts_dir, filename)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Prefer a markdown H1 so titles can include punctuation (e.g. "Chewy thoughts: ...")
        h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if h1_match:
            title = h1_match.group(1).strip()
        else:
            title = filename.replace('.md', '').replace('_', ' ').title()

        dates = parse_blog_dates(content)
        description = _extract_description(content)

        # Slug from filename; strip characters that are illegal in URLs
        url_slug = re.sub(r'[^a-zA-Z0-9_-]', '-', filename.replace('.md', '').lower())
        url_slug = re.sub(r'-+', '-', url_slug).strip('-')

        blog_info = {
            'title': title,
            'filename': filename,
            'slug': url_slug,
            'description': description,
        }
        if dates['created']:
            blog_info['date'] = dates['created']
        if dates['updated']:
            blog_info['updated'] = dates['updated']

        return blog_info

    except Exception as e:
        print(f"Error reading blog file {filename}: {e}")
        return None
