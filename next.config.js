/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['t.me', 'telegram.org'],
  },
}

module.exports = nextConfig