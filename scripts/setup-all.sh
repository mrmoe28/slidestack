#!/bin/bash
set -e

echo "🚀 SlideShow App - Complete Setup"
echo "================================"
echo ""
echo "This script will guide you through setting up all required services."
echo ""
read -p "Press Enter to continue..."

# Create .env.local files from examples
if [ ! -f "apps/web/.env.local" ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "✅ Created apps/web/.env.local"
fi

if [ ! -f "apps/worker/.env.local" ]; then
  cp apps/worker/.env.example apps/worker/.env.local
  echo "✅ Created apps/worker/.env.local"
fi

echo ""
echo "📝 Step 1: NextAuth"
bash scripts/setup-nextauth.sh

echo ""
echo "📝 Step 2: Database (Neon Postgres)"
bash scripts/setup-neon.sh

echo ""
echo "📝 Step 3: Redis Queue"
bash scripts/setup-redis.sh

echo ""
echo "📝 Step 4: Storage (Cloudflare R2)"
bash scripts/setup-r2.sh

echo ""
echo "📝 Step 5: Email (SMTP)"
bash scripts/setup-email.sh

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Run database migrations:"
echo "   cd packages/db"
echo "   pnpm drizzle-kit generate"
echo "   pnpm drizzle-kit push"
echo ""
echo "2. Install all dependencies:"
echo "   pnpm install"
echo ""
echo "3. Start development:"
echo "   pnpm dev:web"
echo ""
echo "4. In another terminal, start worker:"
echo "   pnpm dev:worker"
echo ""
echo "Your environment files are ready at:"
echo "  - apps/web/.env.local"
echo "  - apps/worker/.env.local"
