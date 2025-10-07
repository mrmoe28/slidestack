import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// Allow build to succeed without DATABASE_URL during build time
// At runtime in production, this will be required
let pool: Pool | null = null

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  })
} else if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
  throw new Error('DATABASE_URL environment variable is required in production')
}

export const db = pool ? drizzle(pool, { schema }) : (null as any)
