# Slideshow App

Turn images, videos, and audio into MP4 slideshow videos with transitions, captions, and background music.

## Architecture

- **apps/web**: Next.js 14 App Router + TypeScript UI/API
- **apps/worker**: Node 20 + ffmpeg render worker (Dockerized)
- **packages/db**: Drizzle ORM + Neon Postgres schema
- **packages/ui**: Shared UI components (optional)

## Tech Stack

- Next.js 14 (App Router)
- React 19 + TypeScript
- Drizzle ORM + Neon Postgres
- Redis (Upstash) for job queue
- S3/R2 for storage
- NextAuth (email magic link)
- shadcn/ui + Tailwind v3
- ffmpeg for video rendering

## Development

```bash
# Install dependencies
pnpm install

# Run web app
pnpm dev:web

# Run worker (local)
pnpm dev:worker

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build all
pnpm build
```

## Environment Setup

See `.env.example` files in `apps/web` and `apps/worker` for required variables.

## Deployment

- **Web**: Vercel
- **Worker**: Fly.io or Railway (Docker)
