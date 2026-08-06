import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/links";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/casos/que-pinta-salta`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/casos/maestria`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
