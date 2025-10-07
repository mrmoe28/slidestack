import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().describe('Neon Postgres pooled connection URL'),

  // Redis Queue
  REDIS_URL: z.string().url().describe('Redis connection URL (Upstash or compatible)'),

  // S3-Compatible Storage (R2 or AWS S3)
  S3_ENDPOINT: z.string().url().describe('S3 endpoint URL'),
  S3_ACCESS_KEY_ID: z.string().min(1).describe('S3 access key ID'),
  S3_SECRET_ACCESS_KEY: z.string().min(1).describe('S3 secret access key'),
  S3_BUCKET: z.string().min(1).describe('S3 bucket name'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32).describe('NextAuth secret (min 32 chars)'),
  NEXTAUTH_URL: z.string().url().describe('NextAuth callback URL'),

  // Email (SMTP)
  EMAIL_SERVER_HOST: z.string().min(1).describe('SMTP server host'),
  EMAIL_SERVER_PORT: z.string().regex(/^\d+$/).describe('SMTP server port'),
  EMAIL_SERVER_USER: z.string().min(1).describe('SMTP username'),
  EMAIL_SERVER_PASSWORD: z.string().min(1).describe('SMTP password'),
  EMAIL_FROM: z.string().email().describe('From email address'),

  // App Config
  APP_FPS: z
    .string()
    .regex(/^\d+$/)
    .default('30')
    .transform(val => parseInt(val, 10))
    .describe('Default video FPS'),
  APP_DEFAULT_ASPECT: z
    .enum(['16:9', '9:16', '1:1'])
    .default('16:9')
    .describe('Default aspect ratio'),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv

  try {
    cachedEnv = envSchema.parse(process.env)
    return cachedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors
        .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
        .map(e => e.path.join('.'))

      const invalid = error.errors
        .filter(e => e.code !== 'invalid_type' || e.received !== 'undefined')
        .map(e => `${e.path.join('.')}: ${e.message}`)

      let message = '❌ Environment validation failed:\n\n'

      if (missing.length > 0) {
        message += `Missing required variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n`
      }

      if (invalid.length > 0) {
        message += `Invalid values:\n${invalid.map(v => `  - ${v}`).join('\n')}\n\n`
      }

      message +=
        'See .env.example files in apps/web and apps/worker for required environment variables.\n'

      throw new Error(message)
    }
    throw error
  }
}

export function requireEnv(): Env {
  return getEnv()
}
