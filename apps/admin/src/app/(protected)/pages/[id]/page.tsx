import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, Home, Info, PaintBucket, PanelsTopLeft, Pencil, Plus } from "lucide-react";
import { z } from "zod";

import { moduleBySlug } from "@/brand/modules";
import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { DeletePageDialog } from "@/components/pages/DeletePageDialog";
import { SectionList } from "@/components/pages/SectionList";
import { CreateTemplateSectionButton } from "@/components/sections/CreateTemplateSectionButton";
import { getAdminHeroSlides } from "@/lib/hero-slides";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { getAdminPageById, type Page } from "@/lib/pages";
import { sectionSummary as summary } from "@/lib/section-summary";
import { getAdminSections } from "@/lib/sections";
import { SECTION_TYPE_LABELS } from "@/lib/validations/section.schema";

/**
 * Sayfa Düzeni: sayfanın bölümleri sitede göründüğü sırayla bir liste olarak.
 * (Önceden her bölüm Dashboard'da ayrı bir kutucuktu.)
 */
export default async function PageLayoutScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isHome = id === HOME_TEMPLATE_KEY;
  if (!isHome && !z.uuid().safeParse(id).success) notFound();

  let page: Page | null = null;
  if (!isHome) {
    page = (await getAdminPageById(id)) as Page | null;
    if (!page) notFound();
    // Modül sayfalarının kendi ekranı var
    const mod = moduleBySlug(page.slug);
    if (mod) redirect(`/modules/${mod.key}`);
  }

  const [sections, slides] = await Promise.all([
    getAdminSections(isHome ? null : id),
    isHome ? getAdminHeroSlides() : Promise.resolve([]),
  ]);
  const template = resolveTemplate(isHome ? HOME_TEMPLATE_KEY : page!.slug, sections);
  const basePath = `/pages/${id}`;
  const activeSlides = slides.filter((s) => s.active).length;

  return (
    <AreaShell
      icon={isHome ? Home : FileText}
      title={isHome ? "Ana Sayfa Düzeni" : page!.title}
      description={
        isHome
          ? "Ana sayfadaki bölümler; sitede yukarıdan aşağı bu sırayla görünür."
          : `Adres: /${page!.slug} · ${page!.published ? "Yayında" : "Taslak (sitede görünmez)"}`
      }
      actions={!isHome && page ? <DeletePageDialog pageId={page.id} pageTitle={page.title} redirectTo="/pages" /> : undefined}
      back={{ href: "/pages", label: "Tüm Sayfalar" }}
    >
      <AreaCard title="Sayfa Ayarları">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {!isHome && (
            <SettingLink href={`${basePath}/bilgiler`} icon={Info} title="Sayfa Bilgileri" text="Başlık, adres, yayın durumu, sayfa SEO'su" />
          )}
          <SettingLink href={`${basePath}/arka-plan`} icon={PaintBucket} title="Sayfa Arka Planı" text="Yalnızca bu sayfanın rengi ve fotoğrafı" />
          {isHome && (
            <SettingLink
              href={`${basePath}/slider`}
              icon={PanelsTopLeft}
              title="Hero Slider"
              text={slides.length ? `${activeSlides} slayt yayında${slides.length > activeSlides ? ` · ${slides.length - activeSlides} gizli` : ""}` : "Henüz slayt yok (en fazla 5)"}
            />
          )}
        </div>
      </AreaCard>

      <AreaCard title={`Bölümler (${sections.length})`} hint="Okları kullanarak sırayı değiştirin; anahtar ile bölümü sitede gizleyin.">
        <SectionList
          pageId={isHome ? null : id}
          editBase={`${basePath}/bolum`}
          rows={sections.map((s) => {
            const entry = s.key ? template.byKey[s.key] : undefined;
            return {
              id: s.id,
              label: entry?.label || s.title || "(Başlıksız bölüm)",
              type: entry ? undefined : SECTION_TYPE_LABELS[s.type],
              summary: summary(s),
              active: s.active,
              locked: entry ? entry.locked !== false : false,
            };
          })}
        />

        {template.missing.length > 0 && (
          <div className="mt-4 grid gap-2">
            {template.missing.map((entry) => (
              <div
                key={entry.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                <p>
                  <span className="font-semibold">{entry.label}</span> bölümü bu sayfanın şablonunda var ama henüz oluşturulmadı.
                </p>
                <CreateTemplateSectionButton pageId={isHome ? null : id} entry={entry} />
              </div>
            ))}
          </div>
        )}

        {template.allowExtraSections && (
          <Link
            href={`${basePath}/yeni-bolum`}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-semibold text-(--brand-accent) transition hover:border-(--brand-accent)/50 hover:bg-surface"
          >
            <Plus className="size-4" />
            Yeni Bölüm Ekle
          </Link>
        )}
      </AreaCard>
    </AreaShell>
  );
}

function SettingLink({ href, icon: Icon, title, text }: { href: string; icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-2xl border border-border p-4 transition hover:border-(--brand-accent)/40 hover:bg-surface">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--brand-primary)/10 text-(--brand-primary) group-hover:bg-(--brand-primary) group-hover:text-white">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-semibold text-(--brand-primary)">
          {title} <Pencil className="size-3.5 opacity-0 transition group-hover:opacity-60" />
        </span>
        <span className="block text-sm text-muted-foreground">{text}</span>
      </span>
    </Link>
  );
}
