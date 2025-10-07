# 🧠 Project Context: SlideShow App
**Author:** Moe  
**Directory:** `/Users/ekodevapps/Desktop/SlideShow`  
**Purpose:** Single source of truth for Claude Code builds and instructions.  
**Goal:** Build a web + render-worker app that turns images, videos, and audio into MP4 slideshow videos with transitions, captions, and background music.

---

## 📦 Tech Stack
- **Frontend/API:** Next.js 15 (App Router, TypeScript, React 19)
- **UI:** ShadCN/ui + Tailwind v4 + Sonner
- **Auth:** NextAuth (Email magic link)
- **ORM:** Drizzle (with Neon Postgres)
- **Queue:** Redis (Upstash)
- **Storage:** Cloudflare R2 or AWS S3
- **Renderer:** Node 20 + ffmpeg (via fluent-ffmpeg) in a Docker worker
- **Hosting:**  
  - Web → Vercel  
  - Worker → Fly.io or Railway  
- **Payments (future):** Stripe or Square

---

## 🧩 Folder Layout

```
SlideShow/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/              # Auth routes group
│   │   │   ├── login/
│   │   │   └── verify/
│   │   ├── (main)/              # Main app routes group
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   └── render/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── projects/       # Project CRUD
│   │   │   ├── render/         # Render job queue
│   │   │   └── webhook/        # Worker callbacks
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # ShadCN components (auto-generated)
│   │   ├── features/           # Feature components
│   │   │   ├── editor/         # Slideshow editor
│   │   │   ├── timeline/       # Timeline UI
│   │   │   └── uploader/       # File upload
│   │   └── layouts/            # Layout components
│   ├── lib/
│   │   ├── db/                 # Database setup
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   └── client.ts       # DB client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── redis.ts            # Redis/Upstash client
│   │   ├── storage.ts          # R2/S3 client
│   │   ├── queue.ts            # Job queue manager
│   │   └── utils.ts            # Utilities
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   │   ├── project.ts          # Project types
│   │   ├── render.ts           # Render job types
│   │   └── media.ts            # Media file types
│   └── providers/              # Context providers
│       └── theme-provider.tsx
├── worker/                      # Separate render worker service
│   ├── src/
│   │   ├── index.ts            # Worker entry point
│   │   ├── renderer.ts         # FFmpeg render logic
│   │   ├── queue-consumer.ts  # Redis job consumer
│   │   └── uploader.ts         # Upload results to storage
│   ├── Dockerfile              # Worker container
│   └── package.json            # Worker dependencies
├── public/                      # Static assets
│   ├── samples/                # Sample media for demo
│   └── fonts/                  # Custom fonts
├── drizzle/                     # Drizzle migrations
├── .env.local                   # Environment variables
├── .env.example                 # Env template
├── next.config.ts               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── drizzle.config.ts            # Drizzle config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
├── CLAUDE.md                    # Claude Code guidelines
└── CONTEXT.md                   # This file

```

---

## 🗄️ Database Schema (Drizzle)

### Tables

**users**
- id (uuid, PK)
- email (text, unique)
- name (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**projects**
- id (uuid, PK)
- user_id (uuid, FK → users.id)
- title (text)
- description (text, nullable)
- status (enum: 'draft', 'processing', 'completed', 'failed')
- config (jsonb) - slideshow configuration
- output_url (text, nullable) - final video URL
- created_at (timestamp)
- updated_at (timestamp)

**media_files**
- id (uuid, PK)
- project_id (uuid, FK → projects.id)
- type (enum: 'image', 'video', 'audio')
- url (text) - R2/S3 URL
- filename (text)
- size (bigint) - bytes
- duration (float, nullable) - seconds for video/audio
- order (integer) - position in timeline
- created_at (timestamp)

**render_jobs**
- id (uuid, PK)
- project_id (uuid, FK → projects.id)
- status (enum: 'queued', 'processing', 'completed', 'failed')
- progress (integer) - 0-100
- error_message (text, nullable)
- started_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- created_at (timestamp)

---

## 🔐 Authentication Flow

1. User enters email on `/login`
2. NextAuth sends magic link email
3. User clicks link → verify token → create session
4. Redirect to `/dashboard`

**NextAuth Config:**
- Provider: Email (magic link)
- Adapter: Drizzle adapter for Postgres
- Session: JWT-based
- Callbacks: Add user ID to session

---

## 🎬 Render Pipeline

### Web App Side

1. User uploads media files → Store in R2/S3
2. User configures slideshow (transitions, durations, captions, music)
3. User clicks "Render Video"
4. API creates `render_jobs` record with status='queued'
5. API pushes job to Redis queue
6. API returns job ID to client
7. Client polls `/api/render/status?jobId=xxx` for progress

### Worker Side

1. Worker container listens to Redis queue
2. Receives job: `{ jobId, projectId, config }`
3. Downloads media files from R2/S3
4. Runs FFmpeg pipeline:
   - Generate image slides with durations
   - Apply transitions (fade, slide, zoom)
   - Add text overlays (captions)
   - Mix background audio
   - Encode to MP4 (H.264 + AAC)
5. Upload final MP4 to R2/S3
6. Update `render_jobs` status='completed' + output URL
7. Call webhook: `POST /api/webhook/render-complete`

---

## 🎨 Core Features (MVP)

### Phase 1: Basic Slideshow
- [x] Project setup (Next.js 15 + TypeScript)
- [ ] Database schema (Drizzle + Neon)
- [ ] Auth (NextAuth email magic link)
- [ ] File upload (drag-drop to R2/S3)
- [ ] Timeline UI (reorder images)
- [ ] Basic render (images → video with simple fade)

### Phase 2: Advanced Features
- [ ] Video clip support
- [ ] Transitions (fade, slide, zoom, wipe)
- [ ] Text captions with positioning
- [ ] Background music (volume control, fade in/out)
- [ ] Progress tracking (real-time updates)
- [ ] Download/share rendered video

### Phase 3: Polish
- [ ] Template library (preset styles)
- [ ] Preview player (before render)
- [ ] Export presets (1080p, 4K, Instagram, YouTube)
- [ ] Batch processing
- [ ] User accounts with storage limits

### Phase 4: Monetization
- [ ] Stripe integration
- [ ] Free tier (3 videos/month, 720p)
- [ ] Pro tier ($9/mo: unlimited, 4K, priority queue)
- [ ] Usage analytics

---

## 🛠️ Environment Variables

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

# Queue (Upstash Redis)
REDIS_URL=redis://default:pass@upstash.io:6379

# Worker
WORKER_WEBHOOK_URL=https://yourapp.com/api/webhook/render-complete
WORKER_API_KEY=shared-secret-between-web-and-worker
```

---

## 🚀 Development Workflow

### Initial Setup

```bash
# Navigate to project
cd /Users/ekodevapps/Desktop/SlideShow

# Initialize Next.js (if not done)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install dependencies
npm install next-auth drizzle-orm drizzle-kit pg @upstash/redis @aws-sdk/client-s3 zod react-hook-form @hookform/resolvers sonner

# Install ShadCN
npx shadcn@latest init
npx shadcn@latest add button input form card dialog progress toast

# Setup Drizzle
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

### Running Locally

```bash
# Web app
npm run dev --turbopack

# Worker (separate terminal)
cd worker
npm run dev
```

### Before Committing

```bash
# Type check
npx tsc --noEmit

# Lint (MANDATORY)
npm run lint

# Build test
npm run build
```

---

## 📝 Current State

**Status:** MVP development - Timeline UI enhancement in progress

**Completed:**
- ✅ CLAUDE.md created with project guidelines
- ✅ CONTEXT.md created with architecture and tech stack
- ✅ Next.js 15 project setup with TypeScript and Tailwind
- ✅ ShadCN UI components configured
- ✅ Drizzle ORM with Neon Postgres
- ✅ NextAuth email authentication
- ✅ Project dashboard UI
- ✅ File upload functionality (base64 storage)
- ✅ Basic timeline drag-and-drop

**In Progress:**
- 🔄 Enhanced timeline UI with controls, playhead, and timestamps
- 🔄 No-scroll layout redesign (100vh viewport)

**Next Steps:**
1. Add timeline controls (playhead, scrubber, time ruler)
2. Add zoom controls and transport controls (play, pause)
3. Implement clip reordering within timeline
4. Add multi-track support (video, audio, text layers)
5. Build FFmpeg worker service
6. Migrate to R2/S3 storage

**Blocked:**
- None

**Known Issues:**
- Timeline missing essential controls (playhead, timestamps, zoom)
- Page requires scrolling to see timeline (poor UX)
- No visual time ruler or frame-accurate positioning

---

## 🧪 Testing Strategy

### Unit Tests
- Database queries (Drizzle)
- Utility functions
- Validation schemas (Zod)

### Integration Tests
- API routes
- Auth flow
- File upload/download
- Redis queue operations

### E2E Tests (Playwright)
- User signup/login flow
- Create project → upload media → render video
- Download rendered video

---

## 🎨 Timeline UI Design Research (2025-10-07)

**Research Sources:**
- React Video Editor best practices
- Timeline scrubber implementations (react-scrubber, tldraw)
- Professional video editor layouts (DaVinci Resolve, Premiere Pro, Clipchamp)

**Key Findings:**

### Essential Timeline Features
1. **Playhead/Scrubber**: Visual indicator of current playback position
2. **Time Ruler**: Timestamps showing seconds/minutes with tick marks
3. **Zoom Controls**: Adjust timeline granularity (frames vs. seconds)
4. **Transport Controls**: Play, pause, skip forward/backward
5. **Multi-track Support**: Separate lanes for video, audio, text
6. **Frame-accurate Control**: Precise positioning and trimming

### Layout Best Practices
1. **No-scroll Design**: Use 100vh viewport height with fixed sections
2. **Stacked Layout**: Preview on top, timeline on bottom
3. **Vertical Track Stacking**: Multiple tracks stacked vertically (z-order)
4. **Space Optimization**: Maximize preview size, minimize chrome

### React Implementation Patterns
1. **TypeScript Types**: Define interfaces for clips, tracks, timeline state
2. **Event Handlers**: onScrubStart, onScrubChange, onScrubEnd
3. **State Management**: Use React hooks (useState, useCallback, useEffect)
4. **Drag & Drop**: Support reordering clips within timeline
5. **GSAP Integration**: For smooth playhead animations (optional)

### Design Decisions
- **Layout**: Fixed 100vh height with three sections (header, main, timeline)
- **Main Area**: Split into left sidebar (tools), center (preview), right sidebar (properties)
- **Timeline Height**: ~200-250px fixed at bottom
- **Controls**: Transport controls in timeline header
- **Time Display**: HH:MM:SS format with frame numbers

---

## 📚 Key Decisions & Rationale

**Why Next.js 15?**
- App Router for modern React patterns
- React 19 Server Components for better performance
- Built-in API routes for backend logic
- Vercel deployment optimized

**Why Drizzle over Prisma?**
- Lighter weight, faster builds
- Better TypeScript inference
- More control over SQL queries

**Why Redis queue?**
- Reliable job processing
- Easy scaling (multiple workers)
- Built-in retry logic
- Upstash offers generous free tier

**Why separate worker service?**
- FFmpeg is CPU-intensive (don't block web server)
- Scale workers independently
- Docker containerization for consistent environment
- Deploy to Fly.io/Railway for cost-effective compute

**Why R2 over S3?**
- No egress fees (huge savings for video delivery)
- S3-compatible API (easy migration)
- Cloudflare CDN integration

---

## 🎯 Success Metrics

**MVP Goals:**
- User can create account via email
- User can upload 5+ images
- User can reorder images in timeline
- User can click "Render" and get MP4 video in <2 minutes
- Video has smooth transitions between images
- User can download final video

**Performance Targets:**
- Page load: <2s (FCP)
- File upload: 10MB image in <5s
- Render time: 1min of video in <2min processing
- API latency: <300ms for CRUD operations

**Quality Targets:**
- Zero TypeScript errors
- Zero ESLint warnings
- 100% auth flow coverage (E2E tests)
- Mobile responsive (works on phones)

---

## 🔒 Security Considerations

- **File Upload:** Validate file types, limit sizes (10MB images, 100MB videos)
- **API Routes:** Require authentication for all project/render endpoints
- **Storage URLs:** Use signed URLs for private media (expire in 1 hour)
- **Worker API:** Verify webhook signatures to prevent unauthorized job updates
- **Rate Limiting:** Implement on render endpoints (max 10 renders/hour per user)

---

## 🐛 Debugging Tips

**FFmpeg issues:**
- Check worker logs for FFmpeg command output
- Test FFmpeg commands locally first
- Verify media file formats are supported

**Upload failures:**
- Check R2/S3 credentials and bucket permissions
- Verify CORS settings on bucket
- Check file size limits

**Render stuck:**
- Check Redis connection and queue health
- Verify worker container is running
- Check for FFmpeg process hangs (timeout after 10min)

**Auth not working:**
- Verify `NEXTAUTH_SECRET` is set
- Check email server configuration
- Test magic link emails in spam folder

---

**Last Updated:** 2025-10-07  
**Updated By:** Claude Code (Initial setup)
