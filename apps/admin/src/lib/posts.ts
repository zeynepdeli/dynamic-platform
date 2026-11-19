import "server-only";

import { adminFetch } from "@/lib/api";
import { isoToLocalInput } from "@/lib/datetime";
import { toTranslationsForm } from "@/lib/i18n";
import { POST_TRANSLATABLE, type PostFormValues } from "@/lib/validations/post.schema";

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  coverImageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export type Post = PostSummary & {
  excerpt: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  translations?: unknown;
};

export async function getAdminPosts(): Promise<PostSummary[]> {
  const response = await adminFetch("/admin/posts");
  if (!response.ok) throw new Error(`Yazılar yüklenemedi (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as PostSummary[]) : [];
}

/** Bulunamazsa null (sayfa 404 gösterir) */
export async function getAdminPost(id: string): Promise<Post | null> {
  const response = await adminFetch(`/admin/posts/${encodeURIComponent(id)}`);
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error(`Yazı yüklenemedi (HTTP ${response.status}).`);
  return (await response.json()) as Post;
}

export function toPostFormValues(post: Post): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    coverImageUrl: post.coverImageUrl ?? "",
    category: post.category ?? "",
    published: post.published,
    publishedAt: isoToLocalInput(post.publishedAt),
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    translations: toTranslationsForm(post.translations, POST_TRANSLATABLE),
  };
}

/** Listede durum etiketi */
export function postStatus(post: Pick<PostSummary, "published" | "publishedAt">, now = Date.now()) {
  if (!post.published) return "draft" as const;
  if (post.publishedAt && new Date(post.publishedAt).getTime() > now) return "scheduled" as const;
  return "live" as const;
}
