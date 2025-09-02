import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude PostgreSQL modules that we don't use
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('pg', 'pg-hstore', 'pg-native');
    }
    return config;
  },
};

export default nextConfig;
