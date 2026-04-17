const nextConfig = {
  output: 'export',          // <-- required for Electron production build
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  }
};

module.exports = nextConfig;
