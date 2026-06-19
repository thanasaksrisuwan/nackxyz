import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // NOTE: headers() does NOT apply with output: "export" (static sites).
  // Security headers are applied via public/_headers file for Cloudflare Pages.
};

export default nextConfig;
