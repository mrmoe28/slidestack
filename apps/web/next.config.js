/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Fix all TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fix all ESLint errors
  },
}

module.exports = nextConfig
