/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com'],
  },
  i18n: {
    locales: ['default','en', 'ja'],
    defaultLocale: 'en',
    localeDetection: false,
  },
}

module.exports = nextConfig
