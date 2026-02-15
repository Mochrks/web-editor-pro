
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for FFmpeg WASM to work
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  reactCompiler: true,
  experimental: {
    // empty for now
  },
};

export default nextConfig;
