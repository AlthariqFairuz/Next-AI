import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Handle Node.js modules that aren't available in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
      pg: false,
      'pg-native': false,
      'pg-query-stream': false,
      dns: false,
      net: false,
      tls: false,
      child_process: false,
      url: false,
    };
    return config;
  },
};

export default nextConfig;
