import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/providers/session-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SlideShow - Create Amazing Video Slideshows',
  description: 'Turn your images, videos, and audio into stunning MP4 slideshow videos with transitions, captions, and background music.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
