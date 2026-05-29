import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 blocks cross-origin requests to dev-only resources (HMR, etc.) by
  // default. When testing the Telegram deep-link button locally we serve the
  // dashboard through ngrok/Cloudflare tunnels — list those hosts here so the
  // dev server accepts them. Production builds ignore this setting.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.trycloudflare.com"],
};

export default nextConfig;
