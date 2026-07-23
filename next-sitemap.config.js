/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://giadung24h.vn',
  generateRobotsTxt: true, // (optional)
  sitemapSize: 7000,
  exclude: ['/admin*', '/owner*', '/shipper*', '/shipping-unit*', '/profile*', '/checkout*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/owner', '/shipper', '/shipping-unit', '/profile', '/checkout'],
      },
    ],
  },
}
