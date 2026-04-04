import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Google (user avatars via NextAuth)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Required for Firebase App Hosting (server-side rendering)
  // Do NOT use `output: "export"` — NextAuth requires SSR
};

export default nextConfig;
