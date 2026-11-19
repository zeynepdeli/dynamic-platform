import "server-only";

import { cache } from "react";

import { apiGet } from "./api";
import type { MenuItem, MenuNode, Page, Post, PostPage, Section, SiteBootstrap } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Site geneli veriler (ayarlar, menü, slider, footer, ana sayfa bölümleri) */
export const getSite = cache(async (): Promise<SiteBootstrap> => {
  const data = await apiGet<SiteBootstrap>("/site/bootstrap");
  if (!data) throw new Error("Site verileri alınamadı.");
  return data;
});

export type PageWithSections = {
  page: Page;
  sections: Section[];
  /** Özel tasarımlı sayfalarda bölümü anahtarıyla bul: section("vizyon") */
  section: (key: string) => Section | undefined;
};

function withSectionLookup(page: Page, sections: Section[]): PageWithSections {
  return {
    page,
    sections,
    section: (key) => sections.find((s) => s.key === key),
  };
}

/** Yayındaki sayfa + bölümleri. Yoksa null (→ notFound()) */
export const getPage = cache(
  async (slug: string): Promise<PageWithSections | null> => {
    // Geçersiz slug API'ye hiç gönderilmez
    if (slug.length > 150 || !SLUG.test(slug)) return null;

    const [page, sections] = await Promise.all([
      apiGet<Page>(`/pages/${slug}`),
      apiGet<Section[]>(`/sections/page/${slug}`),
    ]);

    if (!page) return null;
    return withSectionLookup(page, sections ?? []);
  },
);

/** Ana sayfa bölümleri, aynı section("anahtar") yardımcısıyla */
export async function getHome() {
  const site = await getSite();
  return {
    sections: site.homeSections,
    section: (key: string) => site.homeSections.find((s) => s.key === key),
  };
}

/** Düz menü listesini 2 seviyeli ağaca çevirir */
export function buildMenuTree(
  items: MenuItem[],
  location: MenuItem["location"] = "HEADER",
): MenuNode[] {
  const sorted = items
    .filter((item) => (item.location ?? "HEADER") === location)
    .sort((a, b) => a.order - b.order);
  return sorted
    .filter((item) => item.parentId === null)
    .map((root) => ({
      ...root,
      children: sorted.filter((item) => item.parentId === root.id),
    }));
}

/** Görselin açıklaması (Medya kütüphanesinde girilen alt metni) */
export async function altFor(url: string | null | undefined): Promise<string> {
  if (!url) return "";
  const { mediaAlts } = await getSite();
  return mediaAlts && Object.hasOwn(mediaAlts, url) ? mediaAlts[url] : "";
}

/** Blog listesi (sayfalı) */
export const getPosts = cache(async (page = 1, pageSize = 12): Promise<PostPage> => {
  const safePage = Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1;
  const safeSize = Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= 50 ? pageSize : 12;
  return (
    (await apiGet<PostPage>(`/posts?page=${safePage}&limit=${safeSize}`)) ?? {
      items: [],
      total: 0,
      page: 1,
      pageSize: safeSize,
      totalPages: 1,
    }
  );
});

/** Yayındaki tek yazı. Yoksa null (→ notFound()) */
export const getPost = cache(async (slug: string): Promise<Post | null> => {
  if (slug.length > 150 || !SLUG.test(slug)) return null;
  return apiGet<Post>(`/posts/${slug}`);
});
