/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },

  async rewrites() {
    const target = process.env.BACKEND_ORIGIN || "http://localhost:5177";
    return [
      {
        source: "/api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },

  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;