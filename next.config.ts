import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  experimental: {
    // /admin går gjennom proxy.ts, som ellers kutter opplastinger over 10 MB.
    proxyClientMaxBodySize: "50mb",
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async redirects() {
    return [
      {
        // Mangfoldsposten flyttet ut av Nyheter til sin egen adresse.
        source: "/nyheter/mangfoldsposten",
        destination: "/mangfoldsposten",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
