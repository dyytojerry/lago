import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // this includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    domains: ['localhost', 'test.cunguangcanlan.com'],
  },
}

export default nextConfig;
