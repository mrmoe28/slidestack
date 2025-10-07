#!/bin/bash
set -e

echo "☁️  Cloudflare R2 Storage Setup Guide"
echo "================================"
echo ""
echo "1. Sign up at: https://dash.cloudflare.com"
echo "2. Go to R2 Object Storage"
echo "3. Create a bucket named: slideshow-media"
echo "4. Create an API token with R2 read/write permissions"
echo ""
echo "You'll need:"
echo "  - Account ID (found in R2 dashboard)"
echo "  - Access Key ID"
echo "  - Secret Access Key"
echo ""

read -p "Enter your Cloudflare Account ID: " ACCOUNT_ID
read -p "Enter your R2 Access Key ID: " ACCESS_KEY_ID
read -sp "Enter your R2 Secret Access Key: " SECRET_ACCESS_KEY
echo ""
read -p "Enter your bucket name [slideshow-media]: " BUCKET_NAME
BUCKET_NAME=${BUCKET_NAME:-slideshow-media}

if [ -z "$ACCOUNT_ID" ] || [ -z "$ACCESS_KEY_ID" ] || [ -z "$SECRET_ACCESS_KEY" ]; then
  echo "❌ All fields are required"
  exit 1
fi

S3_ENDPOINT="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

# Add to .env.local files
ENV_FILE="apps/web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  cp apps/web/.env.example "$ENV_FILE"
fi

# Update or add S3 config
sed -i.bak "s|^S3_ENDPOINT=.*|S3_ENDPOINT=$S3_ENDPOINT|" "$ENV_FILE"
sed -i.bak "s|^S3_ACCESS_KEY_ID=.*|S3_ACCESS_KEY_ID=$ACCESS_KEY_ID|" "$ENV_FILE"
sed -i.bak "s|^S3_SECRET_ACCESS_KEY=.*|S3_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY|" "$ENV_FILE"
sed -i.bak "s|^S3_BUCKET=.*|S3_BUCKET=$BUCKET_NAME|" "$ENV_FILE"

WORKER_ENV_FILE="apps/worker/.env.local"
if [ ! -f "$WORKER_ENV_FILE" ]; then
  cp apps/worker/.env.example "$WORKER_ENV_FILE"
fi

sed -i.bak "s|^S3_ENDPOINT=.*|S3_ENDPOINT=$S3_ENDPOINT|" "$WORKER_ENV_FILE"
sed -i.bak "s|^S3_ACCESS_KEY_ID=.*|S3_ACCESS_KEY_ID=$ACCESS_KEY_ID|" "$WORKER_ENV_FILE"
sed -i.bak "s|^S3_SECRET_ACCESS_KEY=.*|S3_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY|" "$WORKER_ENV_FILE"
sed -i.bak "s|^S3_BUCKET=.*|S3_BUCKET=$BUCKET_NAME|" "$WORKER_ENV_FILE"

echo ""
echo "✅ R2 configuration saved!"
echo ""
echo "📝 CORS Configuration Required:"
echo ""
echo "Go to your bucket settings and add this CORS policy:"
echo ""
cat <<'EOF'
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
EOF
echo ""
echo "Update 'AllowedOrigins' with your actual domain when deploying."
