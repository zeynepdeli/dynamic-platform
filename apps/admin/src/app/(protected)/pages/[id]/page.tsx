import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Home, LayoutGrid, Palette } from "lucide-react";
import { z } from "zod";

import { EditPageDialog } from "@/components/pages/EditPageDialog";
import { CreateTemplateSectionButton } from "@/components/sections/CreateTemplateSectionButton";
import { SectionDialog } from "@/components/sections/SectionDialog";
import { SectionList } from "@/components/sections/SectionList";

import { getAdminPageById, type Page } from "@/lib/pages";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import {
  getAdminSections,
  toSectionFormValues,
  toSectionItemFormValues,
} from "@/lib/sections";

type PageEditorProps = {
  params: Promise<{ id: string }>;
};

// "home" = Ana Sayfa (bölümleri pageId = null), aksi halde sayfa UUID'si
export default async function PageEditor({ params }: PageEditorProps) {
  const { id } = await params;
  const isHome = id === HOME_TEMPLATE_KEY;

  // URL parametresi doğrulanmadan API'ye gönderilmez
  if (!isHome && !z.uuid().safeParse(id).success) {
    notFound();
  }

  const page = isHome ? null : ((await getAdminPageById(id)) as Page | null);
  if (!isHome && !page) {
    notFound();
  }

  const pageId = page?.id ?? null;
  const sections = await getAdminSections(pageId);
  const template = resolveTemplate(
    isHome ? HOME_TEMPLATE_KEY : (page as Page).slug,
    sections,
  );

  const mediaBaseUrl = (
    process.env.API_PUBLIC_URL ??
    process.env.API_URL ??
    ""
  ).replace(/\/$/, "");

  const title = isHome ? "Ana Sayfa" : (page as Page).title;

  return (
    <main className="min-w-0 space-y-7 pb-10">
      {/* Breadcrumb */}
      <nav
        aria-label="Sayfa yolu"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          href="/pages"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-[#346872]"
        >
          <ArrowLeft className="size-3.5" />
          Sayfa Yönetimi
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      {/* Başlık */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
            {isHome ? <Home className="size-6" /> : <LayoutGrid className="size-6" />}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{isHome ? "/" : `/${(page as Page).slug}`}</span>
              {!isHome && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    (page as Page).published
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-amber-500/10 text-amber-700"
                  }`}
                >
                  {(page as Page).published ? "Yayında" : "Taslak"}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isHome ? (
            <Link
              href="/appearance"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
            >
              <Palette className="size-4" />
              Görünüm & SEO
            </Link>
          ) : (
            <EditPageDialog pageId={(page as Page).id} />
          )}

          {template.allowExtraSections && (
            <SectionDialog
              mode="create"
              pageId={pageId}
              mediaBaseUrl={mediaBaseUrl}
            />
          )}
        </div>
      </header>

      {/* Şablonda olup henüz oluşturulmamış bölümler */}
      {template.missing.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div>
            <h2 className="font-semibold">Tasarımın beklediği bölümler</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu bölümler site tasarımında yer alıyor ama henüz oluşturulmadı.
            </p>
          </div>
          <ul className="space-y-2">
            {template.missing.map((entry) => (
              <li
                key={entry.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">{entry.label}</p>
                  {entry.hint && (
                    <p className="text-xs text-muted-foreground">{entry.hint}</p>
                  )}
                </div>
                <CreateTemplateSectionButton pageId={pageId} entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <SectionList
        pageId={pageId}
        templateByKey={template.byKey}
        mediaBaseUrl={mediaBaseUrl}
        sections={sections.map((section) => ({
          ...section,
          formValues: toSectionFormValues(section),
          items: section.items.map((item) => ({
            ...item,
            formValues: toSectionItemFormValues(item),
          })),
        }))}
      />

      {!isHome && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ExternalLink className="size-3.5" />
          Sayfa başlığı, adresi ve SEO ayarları için “Düzenle” butonunu kullanın.
        </p>
      )}
    </main>
  );
}
