/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  swcMinify: false,
  images: {
    domains: ["arweave.net"],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};
module.exports = nextConfig;
