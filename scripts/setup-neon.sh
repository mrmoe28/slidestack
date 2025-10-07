#!/bin/bash
set -e

echo "🗄️  Neon Postgres Setup Guide"
echo "================================"
echo ""
echo "1. Sign up at: https://neon.tech"
echo "2. Create a new project"
echo "3. Copy the 'Pooled connection' string"
echo ""
echo "Example format:"
echo "postgres://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
echo ""
read -p "Paste your DATABASE_URL here: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL cannot be empty"
  exit 1
fi

# Test connection
echo ""
echo "Testing connection..."
export DATABASE_URL="$DATABASE_URL"

if command -v psql &> /dev/null; then
  if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    echo "✅ Connection successful!"
  else
    echo "⚠️  Connection test failed. Please verify your credentials."
    echo "Proceeding anyway..."
  fi
else
  echo "⚠️  psql not found. Skipping connection test."
fi

# Add to .env.local
ENV_FILE="apps/web/.env.local"
if [ -f "$ENV_FILE" ]; then
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
    echo "✅ Updated DATABASE_URL in $ENV_FILE"
  else
    echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
    echo "✅ Added DATABASE_URL to $ENV_FILE"
  fi
else
  cp apps/web/.env.example "$ENV_FILE"
  sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
  echo "✅ Created $ENV_FILE with DATABASE_URL"
fi

# Also add to worker env
WORKER_ENV_FILE="apps/worker/.env.local"
if [ -f "$WORKER_ENV_FILE" ]; then
  if grep -q "^DATABASE_URL=" "$WORKER_ENV_FILE"; then
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$WORKER_ENV_FILE"
  else
    echo "DATABASE_URL=$DATABASE_URL" >> "$WORKER_ENV_FILE"
  fi
else
  cp apps/worker/.env.example "$WORKER_ENV_FILE"
  sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$WORKER_ENV_FILE"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  cd packages/db"
echo "  pnpm drizzle-kit generate"
echo "  pnpm drizzle-kit push"
