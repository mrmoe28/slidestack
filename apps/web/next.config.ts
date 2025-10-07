import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix all TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fix all ESLint errors
  },
  images: {
    // Allow data URLs (base64) for images stored in database
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'data',
        hostname: '**',
      },
    ],
  },
  // Note: typedRoutes requires Next.js 15
  // typedRoutes: true,
}

export default nextConfig
