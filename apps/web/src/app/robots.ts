import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/core/config";
import { getSite } from "@/core/site";

export const dynamic = "force-dynamic";

/** /robots.txt — admin → SEO Yönetimi → "Arama motorları siteyi listeleyebilsin" */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = getSiteUrl();
  const { settings } = await getSite().catch(() => ({ settings: { allowIndexing: true } }));
  if (settings.allowIndexing === false) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(base ? { sitemap: `${base}/sitemap.xml`, host: base } : {}),
  };
}
