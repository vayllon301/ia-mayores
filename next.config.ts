import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir llamadas a backend externo
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/backend/:path*',
          destination: 'http://localhost:8000/:path*'
        }
      ]
    };
  }
};

export default nextConfig;
