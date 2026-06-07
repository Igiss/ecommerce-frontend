const apiUrl = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`
      }
    ]
  }
}

export default nextConfig
