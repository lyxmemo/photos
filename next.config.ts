import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? (process.env.BASE_PATH || "") : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
