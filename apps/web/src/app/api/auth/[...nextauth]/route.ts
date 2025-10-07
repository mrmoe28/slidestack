import { handlers } from '@/lib/auth'

// Force dynamic rendering - do not attempt to prerender this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const { GET, POST } = handlers
