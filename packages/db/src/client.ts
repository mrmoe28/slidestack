import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// Skip database connection during build if DATABASE_URL is not available
// This allows Vercel builds to succeed without database access
if (!connectionString) {
  console.warn('DATABASE_URL not set - database operations will be unavailable')
}

let pool: Pool | null = null

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  })
}

// Export db - will be null if DATABASE_URL is not set
// This allows the app to build and deploy, but runtime operations require DATABASE_URL
export const db = pool ? drizzle(pool, { schema }) : (null as any)
