/** @type {import('next').NextConfig} */

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
  : "http://localhost:8000";

const nextConfig = {
  output: 'export',

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.picsum.photos" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' data: blob: https://picsum.photos https://*.picsum.photos ${API_ORIGIN} https://tile.openstreetmap.org https://*.tile.openstreetmap.org`,
              "font-src 'self'",
              "frame-src https://challenges.cloudflare.com",
              `connect-src 'self' https://challenges.cloudflare.com ${API_ORIGIN}`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;