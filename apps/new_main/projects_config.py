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
PROJECTS = [
    {
        'title': 'Monikers',
        'description': 'Mobile-friendly party word game for two teams, with pre-built decks and custom cards.',
        'date': '2025',
        'slug': 'moniker',
        'url': 'https://games.kankawabata.com/Moniker/',
    },
    {
        'title': 'Poetry for Neanderthals',
        'description': 'Team word-guessing game where poets may only speak in single syllables.',
        'date': '2025',
        'slug': 'poetry-for-neanderthals',
        'url': 'https://games.kankawabata.com/poetry_for_neanderthals/',
    },
    {
        'title': 'Mora Jai Box',
        'description': 'Simulator for the Mora Jai puzzle boxes found in Blue Prince.',
        'date': '2025',
        'slug': 'mora-jai-box',
        'url': 'https://games.kankawabata.com/MoraJaiBox/',
    },
    {
        'title': 'GameWork',
        'description': 'TypeScript framework for building multiplayer browser games, with live demos.',
        'date': '2025',
        'slug': 'gamework',
        'url': 'https://games.kankawabata.com/gamework/',
    },
    {
        'title': 'Whistle Detector',
        'description': 'Machine learning application that detects whistle sounds in audio recordings.',
        'date': '2023',
        'slug': 'whistle-detector'
    },
    {
        'title': 'Speech Transcriber',
        'description': 'Web-based speech-to-text with audio visualization and editing.',
        'date': '2023',
        'slug': 'speech-transcriber'
    },
    {
        'title': 'Magic Eye Generator',
        'description': 'Create Magic Eye (autostereogram) images interactively.',
        'date': '2022',
        'slug': 'magic-eye-app'
    },
    {
        'title': 'Morse Code Translator',
        'description': 'Morse code translator with audio generation and learning tools.',
        'date': '2020',
        'slug': 'morse-code-app'
    },
    {
        'title': 'Web Soundboard',
        'description': 'Interactive soundboard for playing sound effects and music clips.',
        'date': '2023',
        'slug': 'web-soundboard'
    },
    {
        'title': 'Chat Highlights Parser',
        'description': 'Parse chat logs to extract highlights and interesting moments.',
        'date': '2023',
        'slug': 'chat-highlights'
    },
    {
        'title': 'ELIZA Parser',
        'description': 'Modern web implementation of the classic ELIZA chatbot.',
        'date': '2023',
        'slug': 'eliza-parser'
    },
    {
        'title': 'Webcam Ruler',
        'description': 'Measure objects using your webcam with computer vision.',
        'date': '2022',
        'slug': 'webcam-ruler'
    },
    {
        'title': 'You Laugh You Lose',
        'description': 'Try not to laugh while watching a YouTube video — your webcam scores every break.',
        'date': '2026',
        'slug': 'you-laugh-you-lose'
    },
    {
        'title': 'Voice Stripper',
        'description': 'Remove vocals from audio tracks using audio processing.',
        'date': '2023',
        'slug': 'voice-stripper'
    }
]

def get_projects():
    """Get all projects."""
    return PROJECTS

def get_blog_posts_dir():
    """Folder of markdown blog posts at the repo root."""
    return os.path.join(settings.BASE_DIR, 'blog_posts')

def get_blogs():
    """Automatically load blogs from the blog_posts folder."""
    blogs = []
    blog_posts_dir = get_blog_posts_dir()

    if not os.path.exists(blog_posts_dir):
        return blogs

    for filename in os.listdir(blog_posts_dir):
        if filename.endswith('.md'):
            blog_info = _extract_blog_info(filename, blog_posts_dir)
            if blog_info:
                blogs.append(blog_info)

    # Sort by date (newest first)
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
    """Extract blog information from HTML file."""
    file_path = os.path.join(blog_posts_dir, filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title from filename (remove .md and convert to title case)
        title = filename.replace('.md', '').replace('_', ' ').title()
        
        # Try to extract date from content
        date_match = re.search(r'\| (\w+ \d+, \d+)', content)
        date_str = date_match.group(1) if date_match else None

        description = _extract_description(content)

        # Create URL slug from filename
        url_slug = filename.replace('.md', '').replace(' ', '-').lower()
        # Ensure slug is not empty and contains valid characters
        if not url_slug or not re.match(r'^[-a-zA-Z0-9_]+$', url_slug):
            # Fallback: create a simple slug from the title
            url_slug = re.sub(r'[^a-zA-Z0-9_-]', '-', title.lower())
            url_slug = re.sub(r'-+', '-', url_slug).strip('-')
        
        blog_info = {
            'title': title,
            'filename': filename,
            'slug': url_slug,
            'description': description
        }
        
        # Add date if found
        if date_str:
            try:
                blog_info['date'] = datetime.strptime(date_str, '%b %d, %Y')
            except ValueError:
                pass
        
        return blog_info
        
    except Exception as e:
        print(f"Error reading blog file {filename}: {e}")
        return None
