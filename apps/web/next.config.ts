import "@sagentong/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["@sagentong/db", "@sagentong/auth", "@sagentong/env", "@sagentong/storage"],
  serverExternalPackages: ["pg"],
};

export default nextConfig;
