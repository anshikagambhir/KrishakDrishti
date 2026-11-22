/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_URL || (process.env.VERCEL ? '' : 'http://localhost:5000')).replace(/\/$/, '');
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  async rewrites() {
    // Same-origin server-side proxy avoids CORS and leaking backend secrets to browser.
    // On Vercel, BACKEND_URL must point to a separately deployed backend service.
    if (!backendUrl) return [];
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};
module.exports = nextConfig;
