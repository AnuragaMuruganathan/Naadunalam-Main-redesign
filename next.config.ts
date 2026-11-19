import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve files from public/images as-is: no /_next/image requests, so no
    // Vercel Image Optimization usage. The files are pre-sized and compressed
    // to WebP by `npm run images` (scripts/optimize-images.mjs).
    unoptimized: true,
    // Inactive while `unoptimized` is on; kept so re-enabling optimization
    // is a one-line change.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
};

export default nextConfig;
