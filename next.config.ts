import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.local", "192.168.0.7"],
  images: {
    minimumCacheTTL: 2592000, // 30 days — card images never change
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.hololive-official-cardgame.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
