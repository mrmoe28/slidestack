#!/bin/bash
set -e

echo "🔐 NextAuth Setup"
echo "================================"
echo ""

# Generate secret
if command -v openssl &> /dev/null; then
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  echo "✅ Generated NEXTAUTH_SECRET"
else
  echo "⚠️  openssl not found. Using random string."
  NEXTAUTH_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32)
fi

read -p "Enter your app URL [http://localhost:3000]: " NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}

# Add to .env.local
ENV_FILE="apps/web/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  cp apps/web/.env.example "$ENV_FILE"
fi

sed -i.bak "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" "$ENV_FILE"
sed -i.bak "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=$NEXTAUTH_URL|" "$ENV_FILE"

echo ""
echo "✅ NextAuth configuration saved!"
echo ""
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo ""
echo "⚠️  Keep your NEXTAUTH_SECRET private!"
