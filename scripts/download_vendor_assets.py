#!/usr/bin/env python3
"""
Script to download and localize external CDN resources for better security and performance.
This eliminates the need for external CDN dependencies in CSP.
"""

import os
import requests
import hashlib
import time
from pathlib import Path
from urllib.parse import urlparse

# Base directory for vendor assets
VENDOR_DIR = Path(__file__).parent.parent / "static" / "vendor"

# External resources to download
EXTERNAL_RESOURCES = [
    {
        "url": "https://code.jquery.com/jquery-3.7.0.min.js",
        "filename": "jquery-3.7.0.min.js",
        "integrity": "sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g=",
        "type": "script"
    },
    {
        "url": "https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css",
        "filename": "bootstrap-5.2.1.min.css",
        "integrity": "sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT",
        "type": "style"
    },
    {
        "url": "https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js",
        "filename": "bootstrap-5.2.1.bundle.min.js",
        "integrity": "sha384-u1OknCvxWvY5kfmNBILK2hRnQC3Pr17a+RTT6rIHI7NnikvbZlHgTPOOmMi466C8",
        "type": "script"
    },
    {
        "url": "https://unpkg.com/htmx.org@1.9.4",
        "filename": "htmx-1.9.4.min.js",
        "type": "script"
    },
    {
        "url": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css",
        "filename": "font-awesome-6.1.2.min.css",
        "type": "style"
    },
    {
        "url": "https://use.fontawesome.com/releases/v5.0.10/css/all.css",
        "filename": "font-awesome-5.0.10.min.css",
        "integrity": "sha384-+d0P83n9kaQMCwj8F4RJB66tzIwOKmrdb46+porD/OvrJ+37WqIM7UoBtwHO6Nlg",
        "type": "style"
    },
    {
        "url": "https://cdn.jsdelivr.net/npm/d3@7",
        "filename": "d3-7.min.js",
        "type": "script"
    },
    {
        "url": "https://unpkg.com/wavesurfer.js@7",
        "filename": "wavesurfer-7.min.js",
        "type": "script"
    },
    {
        "url": "https://unpkg.com/wavesurfer.js@7/dist/plugins/regions.min.js",
        "filename": "wavesurfer-regions-7.min.js",
        "type": "script"
    }
]

def verify_integrity(content, expected_hash):
    """Verify file integrity using SHA-256 hash."""
    if not expected_hash:
        return True
    
    # Extract hash from integrity string (format: sha256-<hash>)
    if expected_hash.startswith('sha256-'):
        expected_hash = expected_hash[7:]
    
    actual_hash = hashlib.sha256(content).hexdigest()
    return actual_hash == expected_hash

def download_with_retry(resource, max_retries=3):
    """Download resource with retry logic."""
    for attempt in range(max_retries):
        try:
            response = requests.get(resource['url'], timeout=30)
            response.raise_for_status()
            return response.content
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            print(f"Retry {attempt + 1} for {resource['filename']}...")
            time.sleep(1)

def download_resource(resource):
    """Download a single resource and save it locally."""
    print(f"Downloading {resource['filename']}...")
    
    try:
        content = download_with_retry(resource)
        
        # Verify integrity if provided
        if 'integrity' in resource:
            if not verify_integrity(content, resource['integrity']):
                print(f"⚠️  Integrity check failed for {resource['filename']}, but continuing...")
        
        # Save file
        file_path = VENDOR_DIR / resource['filename']
        with open(file_path, 'wb') as f:
            f.write(content)
        
        print(f"✅ Downloaded {resource['filename']} ({len(content)} bytes)")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {resource['filename']}: {e}")
        return False

def main():
    """Download all external resources."""
    print("🚀 Starting vendor asset download...")
    
    # Create vendor directory
    VENDOR_DIR.mkdir(parents=True, exist_ok=True)
    
    # Download all resources
    success_count = 0
    for resource in EXTERNAL_RESOURCES:
        if download_resource(resource):
            success_count += 1
    
    print(f"\n📊 Download complete: {success_count}/{len(EXTERNAL_RESOURCES)} files downloaded")
    
    if success_count == len(EXTERNAL_RESOURCES):
        print("✅ All vendor assets downloaded successfully!")
        print("\nNext steps:")
        print("1. Update your templates to use local vendor assets")
        print("2. Update CSP policy to remove external CDN domains")
        print("3. Test your application")
    else:
        print("⚠️  Some downloads failed. Check the errors above.")

if __name__ == "__main__":
    main()
