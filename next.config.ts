import type { NextConfig } from "next"

const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io"

let imagekitOrigin = "https://ik.imagekit.io"
try {
  imagekitOrigin = new URL(imagekitEndpoint).origin
} catch (e) {
  // fallback if URL parsing fails
}

const isDev = process.env.NODE_ENV !== "production"

// E2: Build a strict Content-Security-Policy allow-list
const ContentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,       // tighten further once nonces are implemented
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${imagekitOrigin} https://lh3.googleusercontent.com`,
  "font-src 'self'",
  `connect-src 'self' https://api.imagekit.io ${imagekitOrigin} https://accounts.google.com`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!process.env.LOCAL_LAB_MODE ? ["upgrade-insecure-requests"] : []),
].join("; ")

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
}

export default nextConfig

