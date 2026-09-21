import type { MetadataRoute } from "next";
import { allLessons } from "@/lib/corpus";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lexio-roan.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site}/presentation`, priority: 1, changeFrequency: "monthly" },
    { url: `${site}/`, priority: 0.8, changeFrequency: "daily" },
    { url: `${site}/abonnement`, priority: 0.6, changeFrequency: "monthly" },
    ...allLessons().map((l) => ({
      url: `${site}/lecon/${l.id}`,
      priority: 0.4,
      changeFrequency: "monthly" as const,
    })),
  ];
}
