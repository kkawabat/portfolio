# Security Migration Guide: From CDN to Local Assets

## Overview

This guide helps you migrate from external CDN dependencies to local vendor assets for better security, performance, and reliability.

## Why This Migration?

### Security Benefits
- **No External Dependencies**: Eliminates risk of CDN compromise
- **Strict CSP**: Can use `'self'` only policy for maximum security
- **Integrity Control**: You control the exact versions of all assets
- **No Tracking**: External CDNs can't track your users

### Performance Benefits
- **Faster Loading**: No external DNS lookups or network requests
- **Better Caching**: Assets served from your domain with your cache headers
- **Offline Capability**: Works even if external CDNs are down
- **Reduced Latency**: No cross-origin requests

### Reliability Benefits
- **No Single Points of Failure**: Your site works independently
- **Version Control**: Assets are versioned with your code
- **Consistent Availability**: No dependency on external services

## Migration Steps

### 1. Download Vendor Assets

Run the vendor asset download script:

```bash
python scripts/download_vendor_assets.py
```

This downloads all external dependencies to `static/vendor/`:
- jQuery 3.7.0
- Bootstrap 5.2.1 (CSS & JS)
- HTMX 1.9.4
- Font Awesome 5.0.10 & 6.1.2
- D3.js 7
- WaveSurfer.js 7

### 2. Update Templates

Replace external CDN references with local assets:

**Before:**
```html
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet">
```

**After:**
```html
<script src="{% static 'vendor/jquery-3.7.0.min.js' %}"></script>
<link href="{% static 'vendor/bootstrap-5.2.1.min.css' %}" rel="stylesheet">
```

### 3. Update CSP Policy

The CSP policy has been updated to be more restrictive:

**Before (permissive):**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdn.jsdelivr.net https://unpkg.com
```

**After (secure):**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

### 4. Test Your Application

1. **Deploy the changes**
2. **Test all functionality**:
   - Navigation works
   - JavaScript interactions work
   - Styling is correct
   - All apps function properly

## Template Migration

### Option A: Gradual Migration (Recommended)

1. Create new template files with `_local` suffix
2. Test thoroughly
3. Replace original templates when ready

### Option B: Direct Replacement

1. Backup original templates
2. Replace CDN references with local assets
3. Test immediately

## Files to Update

### Core Templates
- `templates/_base.html` → `templates/_base_local.html`
- `templates/project_base.html` → `templates/project_base_local.html`

### App-Specific Templates
Update these files to use local assets:
- `apps/main/templates/main/index.html`
- `apps/new_main/templates/new_main/index.html`
- `apps/whistle_detector/templates/whistle_detector/index.html`
- `apps/speech_transcriber/templates/speech_transcriber/index.html`
- `apps/eliza_parser/templates/eliza_parser/index.html`
- `apps/chat_highlights/templates/chat_highlights/index.html`

## Verification

### Check CSP Compliance
```bash
# Test with browser dev tools
# Should see no CSP violations in console
```

### Verify Asset Loading
```bash
# Check that all assets load from your domain
curl -I https://yourdomain.com/static/vendor/jquery-3.7.0.min.js
```

### Performance Testing
```bash
# Compare load times before/after
# Should see improved performance
```

## Rollback Plan

If issues arise:

1. **Revert CSP policy** to allow external CDNs
2. **Restore original templates** with CDN references
3. **Redeploy** to restore functionality
4. **Debug issues** with local assets

## Maintenance

### Updating Vendor Assets

1. **Check for updates** to vendor libraries
2. **Download new versions** using the script
3. **Test thoroughly** before deploying
4. **Update version references** in templates if needed

### Monitoring

- **Monitor CSP violations** in browser console
- **Check asset loading** in network tab
- **Verify functionality** across all apps

## Security Best Practices

### CSP Optimization

Consider further CSP restrictions:
- Remove `'unsafe-inline'` by using nonces
- Remove `'unsafe-eval'` if not needed
- Add `'strict-dynamic'` for better security

### Asset Integrity

- **Verify checksums** of downloaded assets
- **Use SRI** (Subresource Integrity) for critical assets
- **Regular security audits** of vendor libraries

## Conclusion

This migration significantly improves your application's security posture while maintaining functionality and improving performance. The local asset approach is the gold standard for production applications.
