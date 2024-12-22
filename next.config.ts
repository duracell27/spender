import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "private-avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
