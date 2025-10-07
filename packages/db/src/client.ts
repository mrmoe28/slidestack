import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// Allow build to succeed without DATABASE_URL during build time
// Create a mock db for when DATABASE_URL is not available
let pool: Pool | null = null

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  })
}

// Export db - will be null if DATABASE_URL is not set
// This allows the app to build and deploy, but database operations will fail
// until DATABASE_URL is configured in environment variables
export const db = pool ? drizzle(pool, { schema }) : (null as any)
