import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Home, LayoutGrid } from "lucide-react";
import { z } from "zod";

import { VisualPageEditor } from "@/components/visual/VisualPageEditor";

import { getPageForEditAction } from "@/app/actions/pages";
import { getFooterFormValues } from "@/lib/footer";
import { getAdminHeroSlides, toHeroSlideFormValues } from "@/lib/hero-slides";
import { getMediaBaseUrl } from "@/lib/media-base-url";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";
import { HOME_TEMPLATE_KEY, resolveTemplate } from "@/lib/page-templates";
import { getAdminPageById, type Page } from "@/lib/pages";
import { getAdminSections, toSectionFormValues, toSectionItemFormValues } from "@/lib/sections";
import { getSiteSettings } from "@/lib/site-settings";
import { HEX_COLOR_REGEX } from "@/lib/validations/common";

type PageEditorProps = { params: Promise<{ id: string }> };

const hex = (value: string, fallback: string) => (HEX_COLOR_REGEX.test(value) ? value : fallback);

/**
 * Görsel sayfa düzenleyici: solda sitenin canlı önizlemesi,
 * sağda tıklanan bloğun ayarları.
 */
export default async function PageEditor({ params }: PageEditorProps) {
  const { id } = await params;
  const isHome = id === HOME_TEMPLATE_KEY;

  // URL parametresi doğrulanmadan API'ye gönderilmez
  if (!isHome && !z.uuid().safeParse(id).success) notFound();

  const page = isHome ? null : ((await getAdminPageById(id)) as Page | null);
  if (!isHome && !page) notFound();

  const pageId = page?.id ?? null;

  const [sections, settings, menuItems, footer, slides, pageForm] = await Promise.all([
    getAdminSections(pageId),
    getSiteSettings(),
    getAdminMenuItems(),
    getFooterFormValues(),
    isHome ? getAdminHeroSlides() : Promise.resolve([]),
    pageId ? getPageForEditAction(pageId) : Promise.resolve(null),
  ]);

  const template = resolveTemplate(isHome ? HOME_TEMPLATE_KEY : (page as Page).slug, sections);
  const title = isHome ? "Ana Sayfa" : (page as Page).title;

  return (
    <main className="mx-auto min-w-0 max-w-[1600px] space-y-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-[#346872]">
              <ArrowLeft className="size-3.5" />
              Site Haritası
            </Link>
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#183350]/10 text-[#183350]">
              {isHome ? <Home className="size-5" /> : <LayoutGrid className="size-5" />}
            </span>
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
                {title}
                {!isHome && !(page as Page).published && (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Taslak</span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                Yukarıdan düzenlemek istediğiniz bölümü seçin. Web görünümünü alttaki önizlemeden açabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <VisualPageEditor
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
        background={
          isHome
            ? {
                backgroundColor: settings.homeBackgroundColor ?? "",
                backgroundImage: settings.homeBackgroundImage ?? "",
              }
            : {
                backgroundColor: (page as Page).backgroundColor ?? "",
                backgroundImage: (page as Page).backgroundImage ?? "",
              }
        }
      />
    </main>
  );
}
