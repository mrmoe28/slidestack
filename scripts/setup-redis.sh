#!/bin/bash
set -e

echo "📮 Redis Queue Setup Guide"
echo "================================"
echo ""
echo "Choose an option:"
echo "1. Upstash Redis (free tier, recommended for production)"
echo "2. Local Redis (for development only)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  echo ""
  echo "Upstash Setup:"
  echo "1. Sign up at: https://console.upstash.com"
  echo "2. Create a new Redis database"
  echo "3. Copy the connection string (starts with redis://)"
  echo ""
  read -p "Paste your REDIS_URL here: " REDIS_URL
elif [ "$choice" = "2" ]; then
  echo ""
  echo "Local Redis Setup:"
  echo "Install Redis:"
  echo "  macOS: brew install redis"
  echo "  Ubuntu: sudo apt-get install redis-server"
  echo ""

  if command -v redis-cli &> /dev/null; then
    echo "✅ Redis is installed"

    if redis-cli ping &> /dev/null; then
      echo "✅ Redis is running"
      REDIS_URL="redis://localhost:6379"
    else
      echo "⚠️  Redis not running. Start it with:"
      echo "  macOS: brew services start redis"
      echo "  Ubuntu: sudo systemctl start redis-server"
      REDIS_URL="redis://localhost:6379"
    fi
  else
    echo "⚠️  Redis not found. Using default URL anyway."
    REDIS_URL="redis://localhost:6379"
  fi
else
  echo "❌ Invalid choice"
  exit 1
fi

if [ -z "$REDIS_URL" ]; then
  echo "❌ REDIS_URL cannot be empty"
  exit 1
fi

# Add to .env.local files
ENV_FILE="apps/web/.env.local"
if [ -f "$ENV_FILE" ]; then
  if grep -q "^REDIS_URL=" "$ENV_FILE"; then
    sed -i.bak "s|^REDIS_URL=.*|REDIS_URL=$REDIS_URL|" "$ENV_FILE"
    echo "✅ Updated REDIS_URL in $ENV_FILE"
  else
    echo "REDIS_URL=$REDIS_URL" >> "$ENV_FILE"
    echo "✅ Added REDIS_URL to $ENV_FILE"
  fi
else
  cp apps/web/.env.example "$ENV_FILE"
  sed -i.bak "s|^REDIS_URL=.*|REDIS_URL=$REDIS_URL|" "$ENV_FILE"
  echo "✅ Created $ENV_FILE with REDIS_URL"
fi

WORKER_ENV_FILE="apps/worker/.env.local"
if [ -f "$WORKER_ENV_FILE" ]; then
  if grep -q "^REDIS_URL=" "$WORKER_ENV_FILE"; then
    sed -i.bak "s|^REDIS_URL=.*|REDIS_URL=$REDIS_URL|" "$WORKER_ENV_FILE"
  else
    echo "REDIS_URL=$REDIS_URL" >> "$WORKER_ENV_FILE"
  fi
else
  cp apps/worker/.env.example "$WORKER_ENV_FILE"
  sed -i.bak "s|^REDIS_URL=.*|REDIS_URL=$REDIS_URL|" "$WORKER_ENV_FILE"
fi

echo ""
echo "✅ Setup complete!"
