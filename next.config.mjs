/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['driver.js'],
  }
};

export default nextConfig;