import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPost } from "@/core/site";
import { safeImageSrc } from "@/core/safe";
import { formatPostDate } from "@/components/blog/PostCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const cover = safeImageSrc(post.coverImageUrl);
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt,
      ...(cover && { images: [{ url: cover }] }),
    },
  };
}

// ✏️ MÜŞTERİYE ÖZEL: Yazı detay tasarımı
export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const cover = safeImageSrc(post.coverImageUrl);
  // Paragraflar boş satırla ayrılır; düz metin (HTML çalışmaz)
  const paragraphs = (post.content ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <article>
      <header className="bg-primary text-on-primary">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Link href="/blog" className="text-sm font-semibold opacity-80 hover:underline">
            ← Blog
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider opacity-80">
            {[post.category, formatPostDate(post.publishedAt)].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg leading-8 opacity-90">{post.excerpt}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover" />
        )}
        <div className="space-y-6 text-lg leading-8">
          {paragraphs.map((text, i) => (
            <p key={i} className="whitespace-pre-line">
              {text}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
