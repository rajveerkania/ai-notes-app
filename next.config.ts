import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: undefined, 

  images: {
    domains: ["your-supabase-domain.supabase.co"], 
  },

  reactStrictMode: true
};

export default nextConfig;