import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
        // Kort adresse til trykte plakater og lenker: mangfoldshusetvestland.no/min-historie
        source: "/min-historie",
        destination: "/aktiviteter/cc4d86bf-d97c-4e82-9d19-4819000d36cc",
        permanent: false,
      },
      {
        // Kort adresse til plakaten: mangfoldshusetvestland.no/torsdagssuppe (og /suppe)
        source: "/:slug(torsdagssuppe|suppe)",
        destination: "/tilbud/590c279d-d79a-4b50-9d03-6dd8c311a828",
        permanent: false,
      },
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
