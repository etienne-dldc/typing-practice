/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["src"],
  },
  // experimental: {
  //   outputStandalone: true,
  // },
};

module.exports = nextConfig;
