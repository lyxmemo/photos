import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? (process.env.BASE_PATH || "") : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isStaticExport ? (process.env.BASE_PATH || "") : "",
  },
  images: {
    unoptimized: true,
  },
  // In dev mode, serve /images/* from the API route (reads from data/images/).
  // In static export, images are copied directly into the output directory.
  rewrites: isStaticExport
    ? undefined
    : async () => [
        {
          source: "/images/:path*",
          destination: "/api/images/:path*",
        },
      ],
};

export default nextConfig;
