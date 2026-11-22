import path from "node:path";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// OWASP A05 – Güvenlik yapılandırması.
// Not: script-src içeren tam bir CSP için Next.js'te nonce gerekir
// (middleware/proxy ile). Buradaki CSP Next'i bozmadan uygulanabilen
// güvenli bir taban seviyedir.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

/**
 * Yerel ağdan (ör. telefondan 192.168.1.47:3000) geliştirme sunucusuna erişim.
 * .env.local → DEV_ALLOWED_ORIGINS=192.168.1.47 (virgülle birden fazla).
 * Yalnızca geliştirmede; yalnızca IP/alan adı biçimindeki değerler kabul edilir.
 */
const devAllowedOrigins = isProduction
  ? []
  : (process.env.DEV_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => /^[a-z0-9.-]{1,253}$/i.test(v));

const nextConfig: NextConfig = {
  ...(devAllowedOrigins.length > 0 && { allowedDevOrigins: devAllowedOrigins }),
  // Docker için küçük, bağımsız çıktı (.next/standalone)
  output: "standalone",
  // Monorepo: bağımlılıklar kök node_modules'ta
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
