import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // Spring Boot 서버 주소
      },
    ];
  },
=======
    /* config options here */
>>>>>>> FE/team2/ho
};

export default nextConfig;