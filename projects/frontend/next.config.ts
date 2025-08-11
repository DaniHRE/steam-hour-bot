import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@radix-ui'],
  eslint: {
    dirs: ['src'],
  },
}

export default nextConfig
