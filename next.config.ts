/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
  images: {
    domains: [
      "realive-upload-images.s3.ap-northeast-2.amazonaws.com"
    ]
  },
    // typescript: {
    // ignoreBuildErrors: true, // 권장하지 않음
    // },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
