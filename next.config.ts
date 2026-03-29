import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // /admin går gjennom proxy.ts, som ellers kutter opplastinger over 10 MB.
    proxyClientMaxBodySize: "50mb",
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
