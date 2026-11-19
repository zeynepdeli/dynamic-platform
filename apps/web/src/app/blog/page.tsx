import type { Metadata } from "next";
import Link from "next/link";

import { getPosts } from "@/core/site";
import { PostCard } from "@/components/blog/PostCard";

type Props = { searchParams: Promise<{ sayfa?: string | string[] }> };

export const metadata: Metadata = { title: "Blog" };

/** /blog — yayındaki yazılar, en yeni önce (?sayfa=2) */
export default async function BlogPage({ searchParams }: Props) {
  const raw = (await searchParams).sayfa;
  const requested = typeof raw === "string" && /^\d{1,5}$/.test(raw) ? Number(raw) : 1;
  const { items, page, totalPages } = await getPosts(requested);

  return (
    <>
      <header className="bg-primary text-on-primary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {items.length === 0 ? (
          <p className="text-center text-lg opacity-70">Henüz yazı yok.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Sayfalar" className="mt-12 flex items-center justify-center gap-4 font-semibold">
            {page > 1 && (
              <Link href={page === 2 ? "/blog" : `/blog?sayfa=${page - 1}`} className="hover:underline">
                ← Yeni yazılar
              </Link>
            )}
            <span className="opacity-60">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/blog?sayfa=${page + 1}`} className="hover:underline">
                Eski yazılar →
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
