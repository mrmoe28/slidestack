'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  // Don't show navbar on login/auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/verify')) {
    return null
  }

  const isEditor = pathname.includes('/edit')
  const isDashboard = pathname === '/dashboard' || pathname === '/'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Video className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">SlideShow</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {!isDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            )}

            {isEditor && (
              <div className="text-sm text-gray-600 border-l pl-4">
                <span className="font-medium">Editor Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
