const apiUrl = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '')

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`
      }
    ]
  }
}

export default nextConfig
