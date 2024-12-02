import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 允许使用未优化的图片，包括 data URLs
  },
};

export default nextConfig;
