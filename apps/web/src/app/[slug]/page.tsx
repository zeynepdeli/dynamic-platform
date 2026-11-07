import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPage } from "@/core/site";
import { safeImageSrc } from "@/core/safe";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { PageBackground } from "@/components/site/PageBackground";

type Props = { params: Promise<{ slug: string }> };

/**
 * Genel sayfa şablonu: admin'deki her sayfa burada otomatik çizilir.
 *
 * ✏️ Bir sayfaya ÖZEL tasarım için ayrı klasör açın, ör:
 *   src/app/hakkimizda/page.tsx
 *     const data = await getPage("hakkimizda");
 *     const vizyon = data?.section("vizyon");
 * Next.js sabit klasörü [slug]'dan önce eşleştirir.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPage(slug);
  if (!data) return {};

  const { page } = data;
  const og = safeImageSrc(page.ogImageUrl);

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription ?? undefined,
    keywords: page.seoKeywords ?? undefined,
    robots: page.noIndex ? { index: false, follow: false } : undefined,
    openGraph: og ? { images: [{ url: og }] } : undefined,
  };
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPage(slug);
  if (!data) notFound();

  const { page, sections } = data;

  return (
    <PageBackground color={page.backgroundColor} image={page.backgroundImage}>
      <header className="bg-primary text-on-primary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>
        </div>
      </header>

      {page.content && (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Düz metin: HTML çalışmaz */}
          <p className="whitespace-pre-line text-lg leading-8">{page.content}</p>
        </div>
      )}

      <SectionRenderer sections={sections} />
    </PageBackground>
  );
}
