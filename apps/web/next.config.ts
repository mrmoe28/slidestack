import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix all TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fix all ESLint errors
  },
  // Note: typedRoutes requires Next.js 15
  // typedRoutes: true,
}

export default nextConfig
