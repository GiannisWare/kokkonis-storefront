import type { NextConfig } from "next";

const laravelUrl = new URL(
  process.env.LARAVEL_API_URL ?? "http://localhost:8000",
);
const mediaUrl = process.env.MEDIA_BASE_URL
  ? new URL(process.env.MEDIA_BASE_URL)
  : laravelUrl;

for (const url of [laravelUrl, mediaUrl]) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Laravel and media URLs must use http or https.");
  }
}

const remotePatterns = [laravelUrl, mediaUrl].map((url) => ({
  protocol: url.protocol.slice(0, -1) as "http" | "https",
  hostname: url.hostname,
  port: url.port,
  pathname: url === laravelUrl ? "/storage/**" : "/**",
  search: "",
}));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    maximumRedirects: 0,
    remotePatterns,
  },
};

export default nextConfig;
