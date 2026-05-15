import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Turbopack is the default bundler in Next.js 16.
  // Provide empty config to suppress the "no turbopack config" warning.
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Phaser references `window` and other browser-only APIs,
    // so we must exclude it from server-side bundling.
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('phaser');
      }
    }
    return config;
  },
};

export default nextConfig;
