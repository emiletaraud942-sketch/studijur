import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lexio-roan.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/presentation"], disallow: ["/api/", "/reglages", "/progression"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
