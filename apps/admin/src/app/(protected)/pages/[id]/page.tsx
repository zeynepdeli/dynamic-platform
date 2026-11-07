import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Home, LayoutGrid } from "lucide-react";
import { z } from "zod";

import { HeroSlideDialog } from "@/components/hero/HeroSlideDialog";
import { HeroSlideList } from "@/components/hero/HeroSlideList";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import { HeaderBrandingForm } from "@/components/outline/HeaderBlock";
import { OutlineBlock } from "@/components/outline/OutlineBlock";
import { PageInfoForm } from "@/components/outline/PageInfoForm";
import { PageSections } from "@/components/outline/PageSections";
import { CreateTemplateSectionButton } from "@/components/sections/CreateTemplateSectionButton";
import { FooterForm } from "@/components/settings/FooterForm";

import { getPageForEditAction } from "@/app/actions/pages";
import { getFooterFormValues } from "@/lib/footer";
import { getAdminHeroSlides, toHeroSlideFormValues } from "@/lib/hero-slides";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { getAdminPageById, type Page } from "@/lib/pages";
import { getAdminSections, toSectionFormValues, toSectionItemFormValues } from "@/lib/sections";
import { getSiteSettings } from "@/lib/site-settings";

type PageEditorProps = { params: Promise<{ id: string }> };

/**
 * Bir sayfanın her şeyi, sitedeki sırasıyla yukarıdan aşağıya:
 * Header → (Slider | Sayfa bilgileri) → Bölümler → Footer
 */
export default async function PageEditor({ params }: PageEditorProps) {
  const { id } = await params;
  const isHome = id === HOME_TEMPLATE_KEY;

  // URL parametresi doğrulanmadan API'ye gönderilmez
  if (!isHome && !z.uuid().safeParse(id).success) notFound();

  const page = isHome ? null : ((await getAdminPageById(id)) as Page | null);
  if (!isHome && !page) notFound();

  const pageId = page?.id ?? null;
  const mediaBaseUrl = getMediaBaseUrl();

  const [sections, settings, menuItems, footer, slides, pageForm] = await Promise.all([
    getAdminSections(pageId),
    getSiteSettings(),
    getAdminMenuItems(),
    getFooterFormValues(),
    isHome ? getAdminHeroSlides() : Promise.resolve([]),
    pageId ? getPageForEditAction(pageId) : Promise.resolve(null),
  ]);

  const template = resolveTemplate(isHome ? HOME_TEMPLATE_KEY : (page as Page).slug, sections);
  const menuTree = buildMenuTree(menuItems);
  const title = isHome ? "Ana Sayfa" : (page as Page).title;

  // Numaralar: 1 Header, 2 Slider/Sayfa bilgileri, 3.. bölümler, son Footer
  const firstSectionNumber = 3;
  const footerNumber = firstSectionNumber + sections.length;

  return (
    <main className="mx-auto min-w-0 max-w-6xl space-y-6 pb-16">
      <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-[#346872]">
          <ArrowLeft className="size-3.5" />
          Site Haritası
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      <header className="flex flex-wrap items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
          {isHome ? <Home className="size-6" /> : <LayoutGrid className="size-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{isHome ? "/" : `/${(page as Page).slug}`}</span>
            {!isHome && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  (page as Page).published ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
                }`}
              >
                {(page as Page).published ? "Yayında" : "Taslak"}
              </span>
            )}
          </p>
        </div>
        <p className="w-full text-sm text-muted-foreground sm:w-auto">
          Bloklar sitedeki sırasıyla listelenir. Düzenlemek için bloğa tıklayın.
        </p>
      </header>

      {/* ① Header */}
      <OutlineBlock number={1} title="Header" hint="Logo, site adı ve menü" shared>
        <div className="grid gap-8 xl:grid-cols-2">
          <HeaderBrandingForm
            initialValues={{ siteName: settings.siteName, logoUrl: settings.logoUrl ?? "" }}
            mediaBaseUrl={mediaBaseUrl}
          />
          <div className="space-y-4 xl:border-l xl:border-border xl:pl-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Menü</p>
              <MenuItemDialog mode="create" parents={menuTree.map((n) => ({ id: n.id, label: n.label }))} />
            </div>
            <MenuTree tree={menuTree} />
          </div>
        </div>
      </OutlineBlock>

      {/* ② Slider (ana sayfa) / Sayfa bilgileri (diğer sayfalar) */}
      {isHome ? (
        <OutlineBlock number={2} title="Slider" hint={`${slides.length} slayt · sayfanın en üstündeki kayan alan`}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <HeroSlideDialog mode="create" mediaBaseUrl={mediaBaseUrl} />
            </div>
            <HeroSlideList
              mediaBaseUrl={mediaBaseUrl}
              slides={slides.map((s) => ({ ...s, formValues: toHeroSlideFormValues(s) }))}
            />
          </div>
        </OutlineBlock>
      ) : (
        pageForm?.success && (
          <OutlineBlock number={2} title="Sayfa Bilgileri" hint="Başlık, adres, içerik, SEO ve yayın durumu">
            <PageInfoForm pageId={(page as Page).id} initialData={pageForm.data} />
          </OutlineBlock>
        )
      )}

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
              <li key={entry.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="font-medium">{entry.label}</p>
                  {entry.hint && <p className="text-xs text-muted-foreground">{entry.hint}</p>}
                </div>
                <CreateTemplateSectionButton pageId={pageId} entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ③… Bölümler */}
      <PageSections
        pageId={pageId}
        templateByKey={template.byKey}
        allowExtraSections={template.allowExtraSections}
        mediaBaseUrl={mediaBaseUrl}
        startNumber={firstSectionNumber}
        sections={sections.map((section) => ({
          ...section,
          formValues: toSectionFormValues(section),
          items: section.items.map((item) => ({ ...item, formValues: toSectionItemFormValues(item) })),
        }))}
      />

      {/* Son: Footer */}
      <OutlineBlock
        number={footerNumber}
        title="Footer"
        hint="İletişim bilgileri, sosyal medya ve telif metni"
        shared
        badge={
          !footer.enabled && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Kapalı</span>
          )
        }
      >
        <FooterForm initialValues={footer} />
      </OutlineBlock>

      {!isHome && (page as Page).published && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ExternalLink className="size-3.5" />
          Sitede: <span className="font-mono">/{(page as Page).slug}</span>
        </p>
      )}
    </main>
  );
}
