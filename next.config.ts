import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Verification builds use NEXT_DIST_DIR so they never overwrite the folder a running `next dev` is using.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
