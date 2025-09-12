# GitHub Secrets Configuration

This document outlines the required GitHub Secrets for automated deployment to your droplet.

## Required Secrets

To set up these secrets, go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret.

### 1. Droplet Connection Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DROPLET_HOST` | Your droplet's IP address or domain | `ip.address.XXX.XXX` or `domain.com` |
| `DROPLET_USER` | SSH username for your droplet | `root` or `ubuntu` |
| `DROPLET_SSH_KEY` | Private SSH key for droplet access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DROPLET_PORT` | SSH port (optional, defaults to 22) | `22` |

### 2. Application Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DJANGO_SECRET_KEY` | Django secret key for production | `your-50-character-secret-key` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `kankawabata.com,www.kankawabata.com,localhost,127.0.0.1,0.0.0.0` |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | `AIzaSyB...` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3/Transcribe | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3/Transcribe | `your-40-character-secret` |
| `CADDY_EMAIL` | Email for Let's Encrypt certificates | `your-email@domain.com` |
| `DOMAIN` | Your domain name | `domain.com` |

## How to Get These Values

### Django Secret Key
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the generated API key

### AWS Credentials
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create a new user or use existing
3. Attach policies: `AmazonS3FullAccess` and `AmazonTranscribeFullAccess`
4. Create access keys
5. Copy Access Key ID and Secret Access Key

### SSH Key Setup
1. Generate SSH key pair on your local machine:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   ```
2. Copy public key to your droplet:
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-droplet-ip
   ```
3. Copy private key content to `DROPLET_SSH_KEY` secret

## Security Notes

- **Never commit these values to your repository**
- **Rotate secrets regularly**
- **Use least-privilege access for AWS credentials**
- **Keep SSH keys secure and use strong passphrases**

## Testing the Setup

After setting up all secrets:

1. Push a commit to the `main` branch
2. Check the Actions tab in your GitHub repository
3. Monitor the deployment logs
4. Verify the application is running on your droplet

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify `DROPLET_HOST`, `DROPLET_USER`, and `DROPLET_SSH_KEY`
   - Check if SSH key has correct permissions
   - Ensure droplet allows SSH connections

2. **Environment Variables Not Set**
   - Verify all required secrets are configured
   - Check secret names match exactly (case-sensitive)

3. **Docker Build Failed**
   - Check if all dependencies are properly specified
   - Verify Docker is installed on the droplet

4. **Application Won't Start**
   - Check container logs: `docker-compose logs`
   - Verify environment variables are correctly passed
   - Check if ports are available

### Manual Deployment

If automated deployment fails, you can deploy manually:

```bash
# On your droplet
cd /opt/portfolio
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
