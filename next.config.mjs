/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // This catches ANY request that starts with /api/
        source: '/api/:path*',
        // In development, send it to your local FastAPI. 
        // Later, you can change the production URL to wherever you host your backend!
        destination: process.env.NODE_ENV === 'development' 
            ? 'http://127.0.0.1:8000/api/:path*' 
            : 'https://your-future-production-backend.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;