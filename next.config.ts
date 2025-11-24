import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // remove this whole async rewrites() section
  images: {
    domains: ["img.clerk.com"],
  }
};

export default nextConfig;
