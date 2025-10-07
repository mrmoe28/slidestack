# 🚀 SlideShow App Setup Guide

Complete guide to configure all required services for the SlideShow app.

## Quick Start

Run the automated setup wizard:

```bash
bash scripts/setup-all.sh
```

This will guide you through configuring:
- NextAuth
- Neon Postgres database
- Redis queue
- Cloudflare R2 storage
- Email (SMTP)

## Manual Setup

If you prefer to configure services manually or one at a time:

### 1. NextAuth Configuration

Generate a secure secret and configure the app URL:

```bash
bash scripts/setup-nextauth.sh
```

**Or manually:**

```bash
# Generate secret
openssl rand -base64 32

# Add to apps/web/.env.local
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

---

### 2. Database (Neon Postgres)

Interactive setup:

```bash
bash scripts/setup-neon.sh
```

**Or manually:**

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the **Pooled Connection** string
4. Add to `apps/web/.env.local`:

```bash
DATABASE_URL=postgres://user:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require
```

5. Run migrations:

```bash
cd packages/db
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

---

### 3. Redis Queue

Interactive setup:

```bash
bash scripts/setup-redis.sh
```

**Option A: Upstash (Recommended for Production)**

1. Sign up at [Upstash](https://console.upstash.com)
2. Create a new Redis database
3. Copy the connection string
4. Add to `.env.local`:

```bash
REDIS_URL=redis://default:password@upstash.io:6379
```

**Option B: Local Redis (Development Only)**

```bash
# Install Redis
# macOS:
brew install redis
brew services start redis

# Ubuntu:
sudo apt-get install redis-server
sudo systemctl start redis-server

# Add to .env.local:
REDIS_URL=redis://localhost:6379
```

---

### 4. Storage (Cloudflare R2)

Interactive setup:

```bash
bash scripts/setup-r2.sh
```

**Or manually:**

1. Sign up at [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Object Storage**
3. Create a bucket: `slideshow-media`
4. Create an **API Token** with R2 read/write permissions
5. Note your **Account ID** (shown in R2 dashboard)
6. Add to `.env.local`:

```bash
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET=slideshow-media
```

**CORS Configuration (Required):**

In your R2 bucket settings, add this CORS policy:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Update `AllowedOrigins` with your production domain when deploying.

---

### 5. Email (SMTP)

Interactive setup:

```bash
bash scripts/setup-email.sh
```

**Recommended Providers:**

**Option A: Resend (Easiest)**

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Use onboarding domain for testing or verify your own
4. Add to `.env.local`:

```bash
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your-api-key
EMAIL_FROM=onboarding@resend.dev  # or your-email@yourdomain.com
```

**Option B: SendGrid**

```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=verified@yourdomain.com
```

**Option C: Mailgun**

```bash
EMAIL_SERVER_HOST=smtp.mailgun.org
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-mailgun-username
EMAIL_SERVER_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## Verification

After setup, verify your configuration:

### Test Database Connection

```bash
cd packages/db
pnpm exec tsx -e "
import { getDb } from './src/client';
getDb().execute(sql\`SELECT 1\`).then(() => {
  console.log('✅ Database connected');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});
"
```

### Test Redis Connection

```bash
pnpm exec tsx -e "
import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL });
client.connect().then(() => {
  console.log('✅ Redis connected');
  return client.ping();
}).then(() => client.quit()).catch(console.error);
"
```

### Check All Environment Variables

```bash
pnpm exec tsx -e "
import { getEnv } from '@slideshow/db';
try {
  const env = getEnv();
  console.log('✅ All environment variables valid');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
"
```

---

## Development

Start the development servers:

```bash
# Terminal 1: Web app
pnpm dev:web

# Terminal 2: Worker (after implementing)
pnpm dev:worker
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### Database Connection Issues

- **Error: `connection refused`**
  - Verify your `DATABASE_URL` is correct
  - Check that Neon project is active (not paused)
  - Ensure `?sslmode=require` is in connection string

- **Error: `password authentication failed`**
  - Regenerate password in Neon dashboard
  - Copy the new connection string

### Redis Connection Issues

- **Error: `ECONNREFUSED`**
  - If using local Redis, ensure it's running: `brew services list` or `systemctl status redis`
  - If using Upstash, verify URL format and credentials

### R2/S3 Upload Issues

- **Error: `Access Denied`**
  - Verify API token has read/write permissions
  - Check bucket name matches `S3_BUCKET` in `.env.local`
  - Ensure CORS policy is configured correctly

- **Error: `CORS policy blocked`**
  - Add your domain to `AllowedOrigins` in R2 CORS settings
  - Clear browser cache and try again

### Email Issues

- **Magic link emails not sending**
  - Check SMTP credentials are correct
  - Verify FROM email is verified with your provider
  - Check spam/junk folder
  - Look at Next.js server logs for email errors

---

## Production Deployment

### Environment Variables for Production

Update these in your deployment platform (Vercel, Railway, etc.):

```bash
# Update these for production:
NEXTAUTH_URL=https://yourdomain.com
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
EMAIL_FROM=noreply@yourdomain.com

# Keep these the same:
DATABASE_URL=postgres://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
# ... rest of variables
```

### R2 CORS Update

Update R2 CORS policy to include production domain:

```json
{
  "AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

---

## Need Help?

- Check the [README.md](./README.md) for architecture overview
- See [CONTEXT.md](./CONTEXT.md) for detailed technical docs
- Review `.env.example` files for all required variables

## Service Pricing (as of 2025)

All services have generous free tiers:

- **Neon**: 10 projects, 3GB storage free
- **Upstash**: 10k commands/day free
- **Cloudflare R2**: 10GB storage, 1M requests/month free
- **Resend**: 100 emails/day free
- **Vercel**: Hobby plan free for personal projects

Total cost to start: **$0/month** ✨
