import { auth } from './lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/login/error', '/login/verify']
  const isPublicRoute = publicRoutes.includes(pathname)

  // API routes
  const isAuthApi = pathname.startsWith('/api/auth')

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Allow auth API routes
  if (isAuthApi) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

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
