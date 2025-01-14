/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com'],
  },
  i18n: {
    locales: ['default','en', 'ja'],
    defaultLocale: 'ja',
    localeDetection: false,
  },
}

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NEXT_PUBLIC_ENV === 'development',
})

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withPWA(nextConfig)