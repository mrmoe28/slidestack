import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix all TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fix all ESLint errors
  },
  images: {
    // Allow SVG images
    dangerouslyAllowSVG: true,
    // Note: data URLs (base64) are used with regular <img> tags, not Next.js Image
  },
  // Note: typedRoutes requires Next.js 15
  // typedRoutes: true,
}

export default nextConfig
