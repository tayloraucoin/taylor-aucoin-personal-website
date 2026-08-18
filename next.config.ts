import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["motion"] },
  // Screenshots are where AVIF pays off hardest — large flat UI regions.
  // Next defaults to WebP only; AVIF is tried first and WebP is the fallback.
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
