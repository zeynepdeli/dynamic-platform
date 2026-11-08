import type { MetadataRoute } from "next";

import { apiGet } from "@/core/api";
import { getSiteUrl } from "@/core/config";
import { getSite } from "@/core/site";

export const dynamic = "force-dynamic";

type PublicPage = { slug: string; noIndex: boolean; updatedAt: string };

/** /sitemap.xml — yayındaki ve "arama motorlarında gizle" işaretli olmayan sayfalar */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  if (!base) return [];
  const { settings } = await getSite();
  if (settings.allowIndexing === false) return [];

  const pages = (await apiGet<PublicPage[]>("/pages")) ?? [];
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...pages
      .filter((p) => !p.noIndex && /^[a-z0-9-]+$/.test(p.slug))
      .map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
