#!/usr/bin/env python3
"""
Test script to verify the projects configuration works correctly.
"""

import sys
import os

# Add the project root to Python path
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')

try:
    from apps.new_main.projects_config import get_projects, get_blogs
    
    print("🚀 Testing projects configuration...")
    
    # Test projects
    projects = get_projects()
    print(f"\n📁 Found {len(projects)} projects:")
    for project in projects:
        print(f"  - {project['title']} ({project['id']})")
        print(f"    URL: {project['url']}")
        print(f"    Technologies: {', '.join(project['technologies'])}")
        print()
    
    # Test blogs
    blogs = get_blogs()
    print(f"📝 Found {len(blogs)} blogs:")
    for blog in blogs:
        print(f"  - {blog['title']} ({blog['id']})")
        print(f"    URL: {blog['url']}")
        print()
    
    print("✅ Configuration test completed successfully!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the project root directory.")
except Exception as e:
    print(f"❌ Error: {e}")
