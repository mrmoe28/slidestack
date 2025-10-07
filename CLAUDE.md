# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SlideShow** is a full-stack web application for creating MP4 slideshow videos from images, videos, and audio with transitions, captions, and background music. Built as a monorepo with separate web and worker services.

## Repository Structure

This is a **pnpm workspace monorepo** with Turborepo for build orchestration:

```
SlideShow/
├── apps/
│   ├── web/              # Next.js 15 web app (frontend + API)
│   └── worker/           # FFmpeg render worker (Docker service)
├── packages/
│   ├── db/               # Drizzle ORM + Neon Postgres schemas
│   └── ui/               # Shared UI components (optional)
├── scripts/              # Build and deployment scripts
├── CONTEXT.md            # Single source of truth for architecture
└── package.json          # Root workspace config
```

## Technology Stack

### Web App (`apps/web`)
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + ShadCN UI components
- **Auth**: NextAuth (email magic link)
- **Forms**: React Hook Form + Zod validation
- **UI Library**: ShadCN UI + Sonner (toasts)
- **Deployment**: Vercel

### Worker (`apps/worker`)
- **Runtime**: Node.js 20
- **Rendering**: FFmpeg (via fluent-ffmpeg)
- **Queue**: Redis (Upstash) job consumer
- **Container**: Docker
- **Deployment**: Fly.io or Railway

### Database (`packages/db`)
- **ORM**: Drizzle ORM
- **Database**: Neon Postgres (serverless)
- **Migrations**: Drizzle Kit

### Infrastructure
- **Storage**: Cloudflare R2 (S3-compatible)
- **Queue**: Redis (Upstash)
- **Monorepo**: Turborepo + pnpm workspaces

## Development Commands

### Root Level (Monorepo)

```bash
# Install all dependencies
pnpm install

# Run web app
pnpm dev:web

# Run worker (local development)
pnpm dev:worker

# Build all packages
pnpm build

# Build specific package
pnpm build:web
pnpm build:worker

# Type check all packages
pnpm typecheck

# Lint all packages (MANDATORY after changes)
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Web App (`apps/web`)

```bash
cd apps/web

# Development (DON'T use --turbopack per global rules)
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build

# Production
pnpm start
```

### Worker (`apps/worker`)

```bash
cd apps/worker

# Development
pnpm dev

# Build
pnpm build

# Docker build
docker build -t slideshow-worker .

# Docker run
docker run -p 3001:3001 --env-file .env slideshow-worker
```

### Database (`packages/db`)

```bash
cd packages/db

# Generate migrations
pnpm drizzle:generate

# Push to database
pnpm drizzle:push

# Open Drizzle Studio
pnpm drizzle:studio
```

## Code Architecture

### Detailed Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Auth routes group
│   │   │   ├── login/
│   │   │   └── verify/
│   │   ├── (main)/            # Main app routes (protected)
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   └── render/
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   ├── projects/     # Project CRUD
│   │   │   ├── render/       # Render job queue
│   │   │   └── webhook/      # Worker callbacks
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # ShadCN components (auto-generated)
│   │   ├── features/         # Feature-specific components
│   │   │   ├── editor/       # Slideshow editor
│   │   │   ├── timeline/     # Timeline UI
│   │   │   └── uploader/     # File upload
│   │   └── layouts/          # Layout components
│   ├── lib/
│   │   ├── db/               # Database client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── redis.ts          # Redis/Upstash client
│   │   ├── storage.ts        # R2/S3 client
│   │   ├── queue.ts          # Job queue manager
│   │   └── utils.ts          # Utilities
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   │   ├── project.ts
│   │   ├── render.ts
│   │   └── media.ts
│   └── providers/            # Context providers
└── public/                   # Static assets

apps/worker/
├── src/
│   ├── index.ts              # Worker entry point
│   ├── renderer.ts           # FFmpeg render logic
│   ├── queue-consumer.ts     # Redis job consumer
│   └── uploader.ts           # Upload to storage
├── Dockerfile
└── package.json

packages/db/
├── src/
│   ├── schema/               # Drizzle schema definitions
│   │   ├── users.ts
│   │   ├── projects.ts
│   │   ├── media-files.ts
│   │   └── render-jobs.ts
│   ├── index.ts              # Exports
│   └── client.ts             # Database client
└── drizzle.config.ts         # Drizzle configuration
```

## Database Schema

See `packages/db/src/schema/` for complete schema. Key tables:

- **users** - User accounts (NextAuth)
- **projects** - Slideshow projects with config (jsonb)
- **media_files** - Uploaded images/videos/audio with order
- **render_jobs** - Render queue with status tracking

## Workflow Guidelines

### 1. Before Starting Any Task

1. **Read CONTEXT.md** - Check current project state, decisions, and next steps
2. **Research best practices** - Search for current solutions (2025 standards)
3. **Update CONTEXT.md** - Document your approach and decisions

### 2. Development Workflow

1. **Check monorepo scope** - Identify which package(s) need changes
2. **Make changes** - Follow strict TypeScript and ESLint rules
3. **Run linting** - `pnpm lint` at root level (MANDATORY)
4. **Type check** - `pnpm typecheck` to verify all packages
5. **Test locally** - Run affected services
6. **Update CONTEXT.md** - Document changes and current state

### 3. Adding New Features

1. **Research first** - Find 3-5 sources for best practices
2. **Document decision** - Add to CONTEXT.md with rationale
3. **Implement** - Use ShadCN components, proper TypeScript
4. **Lint & type check** - Fix all errors immediately
5. **Update CONTEXT.md** - Mark feature as complete

## Critical Rules (MUST FOLLOW)

### Monorepo Rules
- **Use workspace references** - Import from `@repo/db` not relative paths across packages
- **Build dependencies first** - Database package must build before web app
- **Shared types** - Put shared types in `packages/db` or create `packages/types`
- **No circular dependencies** - Web can depend on db, but not vice versa

### Next.js Rules (apps/web)
- **App Router ONLY** - No Pages Router
- **Server Components default** - Only use `'use client'` when necessary
- **ShadCN components** - Use ShadCN UI, not custom HTML/CSS
- **Type-safe routes** - Enable `typedRoutes: true` in next.config.ts
- **NO TURBOPACK** - Never use `--turbopack` flag (deployment compatibility)

### Database Rules (packages/db)
- **Drizzle schema** - All schemas in `src/schema/` directory
- **Type exports** - Export inferred types: `export type User = typeof users.$inferSelect`
- **Migrations** - Always generate migrations with `pnpm drizzle:generate`
- **No raw SQL** - Use Drizzle query builder unless absolutely necessary

### Worker Rules (apps/worker)
- **Stateless processing** - Download files, process, upload, cleanup
- **Timeout limits** - Max 10 minutes per render job
- **Error handling** - Catch all errors and update job status
- **Resource cleanup** - Delete temp files after processing

### Code Quality Rules
- **ESLint** - MANDATORY to run after every change
- **Zero TypeScript errors** - Must fix all errors immediately
- **No workarounds** - Implement proper solutions, not hacks
- **No assumptions** - Ask when uncertain, don't guess

### Deployment Rules
- **NEVER create Vercel projects** without explicit permission
- **NEVER deploy** without being asked
- **ALWAYS ask** before deployment-related changes
- **Environment variables** - Update both local and Vercel when changed

## Component Templates

### Server Component (Default)
```typescript
// app/(main)/dashboard/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your slideshow projects',
}

export default async function DashboardPage() {
  // Server-side data fetching
  const projects = await fetchProjects()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {/* Content */}
    </div>
  )
}
```

### Client Component
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  initialValue: string
}

export function ClientComponent({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue)

  return (
    <Button onClick={() => setValue('new')}>
      {value}
    </Button>
  )
}
```

### API Route
```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@repo/db'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const project = await db.insert(projects).values(data)

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Environment Variables

### apps/web/.env.local
```bash
# Database
DATABASE_URL=postgres://user:pass@neon.tech/slideshow?sslmode=require

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
EMAIL_SERVER=smtp://user:pass@smtp.resend.com:587
EMAIL_FROM=noreply@yourapp.com

# Storage (R2 or S3)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=slideshow-media
R2_PUBLIC_URL=https://media.yourapp.com

# Queue
REDIS_URL=redis://default:pass@upstash.io:6379

# Worker
WORKER_API_KEY=shared-secret-between-web-and-worker
```

### apps/worker/.env
```bash
# Database
DATABASE_URL=postgres://user:pass@neon.tech/slideshow?sslmode=require

# Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=slideshow-media

# Queue
REDIS_URL=redis://default:pass@upstash.io:6379

# Worker
WORKER_API_KEY=shared-secret-between-web-and-worker
WORKER_WEBHOOK_URL=https://yourapp.com/api/webhook/render-complete
```

## Testing Strategy

### Unit Tests
- Database queries (packages/db)
- Utility functions
- Validation schemas (Zod)

### Integration Tests
- API routes (apps/web)
- Auth flow
- File upload/download
- Redis queue operations

### E2E Tests (Playwright)
- User signup/login flow
- Create project → upload media → render video
- Download rendered video

## Common Tasks

### Adding a New Page
1. Create in `apps/web/src/app/(main)/your-page/page.tsx`
2. Use Server Component by default
3. Add metadata export
4. Import ShadCN components from `@/components/ui`
5. Run `pnpm lint` and fix errors

### Adding a New API Route
1. Create in `apps/web/src/app/api/your-route/route.ts`
2. Define Zod schema for validation
3. Import database from `@repo/db`
4. Add proper error handling
5. Run `pnpm typecheck`

### Adding Database Table
1. Create schema in `packages/db/src/schema/your-table.ts`
2. Export from `packages/db/src/index.ts`
3. Run `pnpm drizzle:generate` to create migration
4. Run `pnpm drizzle:push` to apply migration
5. Update types in web app

### Adding Worker Job Type
1. Define job type in `packages/db/src/schema/render-jobs.ts`
2. Add handler in `apps/worker/src/renderer.ts`
3. Add queue producer in `apps/web/src/lib/queue.ts`
4. Test locally with both services running

## Debugging Tips

### Monorepo Issues
- **Build failures**: Check package dependencies in turbo.json
- **Import errors**: Verify workspace protocol in package.json (`"@repo/db": "workspace:*"`)
- **Type errors**: Build packages/db first, then apps/web

### Database Issues
- **Connection errors**: Check DATABASE_URL format and SSL mode
- **Migration errors**: Reset with `pnpm drizzle:push --force`
- **Type errors**: Regenerate types with `pnpm drizzle:generate`

### Worker Issues
- **FFmpeg errors**: Check worker logs for command output
- **Queue stuck**: Verify Redis connection and worker is running
- **Upload failures**: Check R2/S3 credentials and CORS settings

## Performance Targets

- **Page load**: <2s (First Contentful Paint)
- **File upload**: 10MB image in <5s
- **Render time**: 1 min of video in <2 min processing
- **API latency**: <300ms for CRUD operations

## Security Checklist

- ✅ Validate file types and sizes on upload
- ✅ Require authentication for all project/render endpoints
- ✅ Use signed URLs for private media (1 hour expiry)
- ✅ Verify webhook signatures from worker
- ✅ Rate limit render endpoints (10 renders/hour per user)
- ✅ Never expose secrets to client (use NEXT_PUBLIC_ prefix only for public vars)

## Additional Notes

- **Context files**: This project uses CONTEXT.md as single source of truth for architecture decisions
- **Tool access**: Desktop Commander and Playwright are available for file operations and browser automation
- **Research first**: Always research current best practices before implementing new features
- **Documentation**: Update CONTEXT.md after every significant change
- **No shortcuts**: Implement proper solutions, never use temporary fixes or workarounds

## Questions?

If anything is unclear:
1. Check CONTEXT.md for project-specific details
2. Check README.md for setup instructions
3. Ask the user for clarification (don't assume)
