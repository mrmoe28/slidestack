import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../apps/web/.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set. Please configure .env.local')
}

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config
