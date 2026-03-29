import type { NextConfig } from "next";

const disableTypecheck = process.env.NEXT_DISABLE_TYPECHECK === "1";
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: disableTypecheck,
  },
  basePath,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
