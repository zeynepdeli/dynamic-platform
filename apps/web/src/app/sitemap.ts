import type { MetadataRoute } from "next";

import { apiGet } from "@/core/api";
import { getSiteUrl } from "@/core/config";
import { getSite } from "@/core/site";
import type { PostPage } from "@/core/types";

export const dynamic = "force-dynamic";

type PublicPage = { slug: string; noIndex: boolean; updatedAt: string };

/** /sitemap.xml — yayındaki ve "arama motorlarında gizle" işaretli olmayan sayfalar */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  if (!base) return [];
  const { settings } = await getSite();
  if (settings.allowIndexing === false) return [];

  const pages = (await apiGet<PublicPage[]>("/pages")) ?? [];
  const posts = await allPosts();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...pages
      .filter((p) => !p.noIndex && /^[a-z0-9-]+$/.test(p.slug))
      .map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...(posts.length > 0 ? [{ url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.6 }] : []),
    ...posts
      .filter((p) => /^[a-z0-9-]+$/.test(p.slug))
      .map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

/** Sitemap için yayındaki yazılar (en fazla 1000) */
async function allPosts() {
  const items: PostPage["items"] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await apiGet<PostPage>(`/posts?page=${page}&limit=50`);
    if (!res) break;
    items.push(...res.items);
    if (page >= res.totalPages) break;
  }
  return items;
}
