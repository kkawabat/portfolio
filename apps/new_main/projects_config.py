"""
Simple configuration for portfolio projects and blogs.
Projects are static, blogs are automatically loaded from the blog_posts folder.
"""

import os
import re
from datetime import datetime
from django.conf import settings

# Simple project list
PROJECTS = [
    {
        'title': 'Whistle Detector',
        'description': 'Machine learning application that detects whistle sounds in audio recordings.',
        'url': '/projects/whistle_detector/'
    },
    {
        'title': 'Speech Transcriber',
        'description': 'Web-based speech-to-text with audio visualization and editing.',
        'url': '/projects/speech_transcriber/'
    },
    {
        'title': 'Magic Eye Generator',
        'description': 'Create Magic Eye (autostereogram) images interactively.',
        'url': '/projects/magic_eye/'
    },
    {
        'title': 'Morse Code Translator',
        'description': 'Morse code translator with audio generation and learning tools.',
        'url': '/projects/morse_code/'
    },
    {
        'title': 'Web Soundboard',
        'description': 'Interactive soundboard for playing sound effects and music clips.',
        'url': '/projects/web_soundboard/'
    },
    {
        'title': 'Chat Highlights Parser',
        'description': 'Parse chat logs to extract highlights and interesting moments.',
        'url': '/projects/chat_highlights/'
    },
    {
        'title': 'ELIZA Parser',
        'description': 'Modern web implementation of the classic ELIZA chatbot.',
        'url': '/projects/eliza_parser/'
    },
    {
        'title': 'Webcam Ruler',
        'description': 'Measure objects using your webcam with computer vision.',
        'url': '/projects/webcam_ruler/'
    },
    {
        'title': 'Voice Stripper',
        'description': 'Remove vocals from audio tracks using audio processing.',
        'url': '/projects/voice_stripper/'
    }
]

def get_projects():
    """Get all projects."""
    return PROJECTS

def get_blogs():
    """Automatically load blogs from the blog_posts folder."""
    blogs = []
    blog_posts_dir = os.path.join(settings.BASE_DIR, 'apps', 'new_main', 'templates', 'blog_posts')
    
    if not os.path.exists(blog_posts_dir):
        return blogs
    
    for filename in os.listdir(blog_posts_dir):
        if filename.endswith('.html'):
            blog_info = _extract_blog_info(filename, blog_posts_dir)
            if blog_info:
                blogs.append(blog_info)
    
    # Sort by date (newest first)
    return sorted(blogs, key=lambda x: x.get('date', datetime.min), reverse=True)

def _extract_blog_info(filename, blog_posts_dir):
    """Extract blog information from HTML file."""
    file_path = os.path.join(blog_posts_dir, filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title from filename (remove .html and convert to title case)
        title = filename.replace('.html', '').replace('_', ' ').title()
        
        # Try to extract date from content
        date_match = re.search(r'\| (\w+ \d+, \d+)', content)
        date_str = date_match.group(1) if date_match else None
        
        # Try to extract description from first paragraph
        desc_match = re.search(r'<p[^>]*>([^<]+)</p>', content)
        description = desc_match.group(1).strip() if desc_match else f"Blog post: {title}"
        
        # Create URL slug from filename
        url_slug = filename.replace('.html', '').replace(' ', '-').lower()
        
        blog_info = {
            'title': title,
            'description': description[:150] + '...' if len(description) > 150 else description,
            'url': f'/blog/{url_slug}/',
            'filename': filename
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
