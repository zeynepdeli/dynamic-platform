import "server-only";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, Info, LayoutGrid, PaintBucket, PanelsTopLeft, Plus } from "lucide-react";

import { AreaHeader } from "@/components/areas/AreaShell";
import { SECTION_TYPE_LABELS } from "@/lib/validations/section.schema";
import { z } from "zod";

import { VisualPageEditor, type Selection } from "@/components/visual/VisualPageEditor";

import { getPageForEditAction } from "@/app/actions/pages";
import { getFooterFormValues } from "@/lib/footer";
import { getAdminSocialLinks } from "@/lib/social-links";
import { getAdminHeroSlides, toHeroSlideFormValues } from "@/lib/hero-slides";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { moduleBySlug } from "@/brand/modules";
import { getAdminPageById, type Page } from "@/lib/pages";
import { getAdminSections, toSectionFormValues, toSectionItemFormValues } from "@/lib/sections";
import { getSiteSettings } from "@/lib/site-settings";
import { HEX_COLOR_REGEX } from "@/lib/validations/common";

const hex = (value: string, fallback: string) => (HEX_COLOR_REGEX.test(value) ? value : fallback);

/**
 * Tek bir bloğun düzenleme ekranı (Slider, Arka plan, bir bölüm...).
 * URL parametreleri API'ye gitmeden doğrulanır.
 */
export async function BlockScreen({ id, block }: { id: string; block: Selection }) {
  const isHome = id === HOME_TEMPLATE_KEY;
  if (!isHome && !z.uuid().safeParse(id).success) notFound();

  // Sayfa türüne ait olmayan bloklar
  if ((block === "hero" && !isHome) || (block === "page" && isHome)) notFound();

  const page = isHome ? null : ((await getAdminPageById(id)) as Page | null);
  if (!isHome && !page) notFound();

  // Modül sayfaları (SSS, İletişim, Galeri) yalnızca kendi ekranından yönetilir
  const mod = page ? moduleBySlug(page.slug) : undefined;
  if (mod) redirect(`/modules/${mod.key}`);
  const pageId = page?.id ?? null;

  const [sections, settings, menuItems, footer, slides, pageForm, socialLinks] = await Promise.all([
    getAdminSections(pageId),
    getSiteSettings(),
    getAdminMenuItems(),
    getFooterFormValues(),
    isHome ? getAdminHeroSlides() : Promise.resolve([]),
    pageId ? getPageForEditAction(pageId) : Promise.resolve(null),
    getAdminSocialLinks(),
  ]);

  // Silinmiş/başka sayfanın bölümü → Site Haritası'na dön
  if (block.startsWith("s:") && !sections.some((s) => s.id === block.slice(2))) {
    redirect("/dashboard");
  }

  const template = resolveTemplate(isHome ? HOME_TEMPLATE_KEY : (page as Page).slug, sections);
  if (block === "new" && !template.allowExtraSections) notFound();

  const pageTitle = isHome ? "Ana Sayfa" : (page as Page).title;

  // Ekran başlığı (enfesGurme düzeni: "X Yönetimi")
  const section = block.startsWith("s:") ? sections.find((s) => s.id === block.slice(2)) : undefined;
  const sectionLabel = section && ((section.key && template.byKey[section.key]?.label) || section.title || "Başlıksız");
  const heading =
    block === "hero"
      ? { icon: PanelsTopLeft, title: "Hero Slider Yönetimi", description: "Ana sayfanın en üstündeki kayan görseller. Fotoğraf, başlık, açıklama ve butonu her slayt için ayrı girin." }
      : block === "background"
        ? { icon: PaintBucket, title: "Sayfa Arka Planı", description: `${pageTitle} sayfasına özel arka plan. Boş bırakırsanız Site Arka Planı kullanılır.` }
        : block === "page"
          ? { icon: Info, title: "Sayfa Bilgileri", description: "Sayfanın başlığı, adresi, yayın durumu ve arama motoru (SEO) bilgileri." }
          : block === "new"
            ? { icon: Plus, title: "Yeni Bölüm", description: `${pageTitle} sayfasına yeni bir bölüm ekleyin.` }
            : { icon: LayoutGrid, title: `${sectionLabel} Bölümü`, description: `${section ? SECTION_TYPE_LABELS[section.type] : ""} · Bölümün metinleri, görselleri ve arka planı.` };

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1800px] space-y-5 pb-12">
      <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-(--brand-accent)">
          <ArrowLeft className="size-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="size-3.5 opacity-50" />
        <span className="font-medium text-foreground">{pageTitle}</span>
        {!isHome && !(page as Page).published && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Taslak</span>
        )}
      </nav>

      <AreaHeader icon={heading.icon} eyebrow={`${pageTitle} Yönetimi`} title={heading.title} description={heading.description} />

      <VisualPageEditor
        block={block}
        basePath={`/pages/${isHome ? HOME_TEMPLATE_KEY : pageId}`}
        isHome={isHome}
        pageId={pageId}
        pageInfo={pageForm?.success ? pageForm.data : null}
        theme={{
          primary: hex(settings.primaryColor, "#183350"),
          secondary: hex(settings.secondaryColor, "#346872"),
          background: hex(settings.backgroundColor, "#ffffff"),
          mediaBaseUrl: getMediaBaseUrl(),
        }}
        branding={{ siteName: settings.siteName, logoUrl: settings.logoUrl ?? "" }}
        menuTree={buildMenuTree(menuItems)}
        slides={slides.map((s) => ({ ...s, formValues: toHeroSlideFormValues(s) }))}
        sections={sections.map((section) => ({
          ...section,
          formValues: toSectionFormValues(section),
          items: section.items.map((item) => ({ ...item, formValues: toSectionItemFormValues(item) })),
        }))}
        templateByKey={template.byKey}
        missing={template.missing}
        allowExtraSections={template.allowExtraSections}
        footer={footer}
        socialLinks={socialLinks}
        headerStyle={{
          backgroundColor: settings.headerBackgroundColor ?? "",
          backgroundImage: settings.headerBackgroundImage ?? "",
          buttonText: settings.headerButtonText ?? "",
        }}
        background={
          isHome
            ? { backgroundColor: settings.homeBackgroundColor ?? "", backgroundImage: settings.homeBackgroundImage ?? "" }
            : { backgroundColor: (page as Page).backgroundColor ?? "", backgroundImage: (page as Page).backgroundImage ?? "" }
        }
      />
    </main>
  );
}
