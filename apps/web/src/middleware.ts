import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/login/error', '/login/verify']
  const isPublicRoute = publicRoutes.includes(pathname)

  // API routes - allow all API routes for now
  const isApiRoute = pathname.startsWith('/api')

  // Static files and Next.js internals are already excluded by matcher

  // Allow public routes and API routes
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next()
  }

  // For protected routes, check for session
  // This is a simple check - you may want to enhance this with actual session verification
  const hasSession = req.cookies.has('authjs.session-token') ||
                     req.cookies.has('__Secure-authjs.session-token')

  if (!hasSession) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
