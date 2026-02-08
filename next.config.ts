import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Enables Docker optimization with minimal production build
};

export default nextConfig;

