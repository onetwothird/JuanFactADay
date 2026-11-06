/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};
export default nextConfig;
