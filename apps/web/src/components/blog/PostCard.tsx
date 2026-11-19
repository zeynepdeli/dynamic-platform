import Link from "next/link";

import { safeImageSrc } from "@/core/safe";
import type { PostSummary } from "@/core/types";

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" });

export function formatPostDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

// ✏️ MÜŞTERİYE ÖZEL: Blog kartı tasarımı
export function PostCard({ post }: { post: PostSummary }) {
  const cover = safeImageSrc(post.coverImageUrl);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-sm ring-1 ring-black/5">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition group-hover:opacity-90" />
        ) : (
          <div className="aspect-[16/9] w-full bg-primary/10" aria-hidden="true" />
        )}
        <div className="flex flex-1 flex-col gap-3 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            {[post.category, formatPostDate(post.publishedAt)].filter(Boolean).join(" · ")}
          </p>
          <h2 className="text-xl font-semibold leading-snug group-hover:underline">{post.title}</h2>
          {post.excerpt && <p className="line-clamp-3 leading-7 opacity-80">{post.excerpt}</p>}
        </div>
      </Link>
    </article>
  );
}
