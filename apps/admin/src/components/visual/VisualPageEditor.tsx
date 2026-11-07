"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Link2,
  Lock,
  MousePointerClick,
  PaintBucket,
  Plus,
  X,
} from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { swapIds } from "@/components/common/OrderButtons";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import { HeaderBrandingForm, type Branding } from "@/components/outline/HeaderBlock";
import { InlineItems } from "@/components/outline/InlineItems";
import { PageInfoForm } from "@/components/outline/PageInfoForm";
import { CreateTemplateSectionButton } from "@/components/sections/CreateTemplateSectionButton";
import { SectionForm } from "@/components/sections/SectionForm";
import { FooterForm } from "@/components/settings/FooterForm";
import { CanvasBlock } from "@/components/visual/CanvasBlock";
import { BackgroundForm } from "@/components/visual/panels/BackgroundForm";
import { SlidesPanel } from "@/components/visual/panels/SlidesPanel";
import {
  PreviewFooter,
  PreviewHeader,
  PreviewHero,
  PreviewPageTitle,
  PreviewSection,
} from "@/components/visual/preview/Previews";
import { color as safeColor, image as safeImage, type PreviewTheme } from "@/components/visual/preview/safe";

import {
  createSectionAction,
  deleteSectionAction,
  reorderSectionsAction,
  setSectionActiveAction,
  updateSectionAction,
} from "@/app/actions/sections";
import type { BackgroundValues } from "@/app/actions/background";
import type { TemplateSection } from "@/brand/page-templates";
import type { HeroSlide } from "@/lib/hero-slides";
import type { MenuNode } from "@/lib/menu";
import type { SectionListEntry } from "@/lib/sections-view";
import type { FooterFormValues } from "@/lib/validations/footer.schema";
import type { HeroSlideFormValues } from "@/lib/validations/hero-slide.schema";
import type { PageFormValues } from "@/lib/validations/page.schema";
import { SECTION_TYPE_LABELS, type SectionFormValues } from "@/lib/validations/section.schema";

type Selection = "header" | "hero" | "page" | "footer" | "new" | "background" | `s:${string}`;

export type VisualPageEditorProps = {
  isHome: boolean;
  pageId: string | null;
  pageInfo: PageFormValues | null;
  theme: PreviewTheme;
  branding: Branding;
  menuTree: MenuNode[];
  slides: (HeroSlide & { formValues: HeroSlideFormValues })[];
  sections: SectionListEntry[];
  templateByKey: Record<string, TemplateSection>;
  missing: TemplateSection[];
  allowExtraSections: boolean;
  footer: FooterFormValues;
  /** Sayfaya özel arka plan (boş = sitenin genel arka planı) */
  background: BackgroundValues;
};

const toolbarButton =
  "inline-flex size-7 items-center justify-center rounded-md hover:bg-neutral-100 disabled:opacity-30";

export function VisualPageEditor(props: VisualPageEditorProps) {
  const { isHome, pageId, theme, sections, templateByKey } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Selection>(
    sections[0] ? `s:${sections[0].id}` : isHome ? "hero" : "page",
  );

  // Kaydedilmemiş canlı değerler (yalnızca seçili blok için)
  const [brandingDraft, setBrandingDraft] = useState<Branding | null>(null);
  const [footerDraft, setFooterDraft] = useState<FooterFormValues | null>(null);
  const [sectionDraft, setSectionDraft] = useState<{ id: string; values: SectionFormValues } | null>(null);
  const [backgroundDraft, setBackgroundDraft] = useState<BackgroundValues | null>(null);
  const [slideDraft, setSlideDraft] = useState<{ id: string; values: HeroSlideFormValues } | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const select = useCallback((next: Selection) => {
    // Başka bloğa geçince kaydedilmemiş önizleme değerleri bırakılır
    setBrandingDraft(null);
    setFooterDraft(null);
    setSectionDraft(null);
    setBackgroundDraft(null);
    setSlideDraft(null);
    setError(null);
    setSelected(next);
  }, []);

  const branding = brandingDraft ?? props.branding;
  const footer = footerDraft ?? props.footer;
  const background = backgroundDraft ?? props.background;
  const pageBgColor = safeColor(background.backgroundColor) ?? theme.background;
  const pageBgImage = safeImage(background.backgroundImage, theme.mediaBaseUrl);

  // Önizlemedeki slaytlar (düzenlenen slayt canlı değerlerle)
  const previewSlides = props.slides.map((slide) => {
    const v = slideDraft?.id === slide.id ? slideDraft.values : slide.formValues;
    return {
      id: slide.id,
      title: v.title,
      subtitle: v.subtitle,
      description: v.description,
      imageUrl: v.imageUrl,
      buttonText: v.buttonText,
      active: v.active,
    };
  });
  const safeHeroIndex = Math.min(heroIndex, Math.max(previewSlides.length - 1, 0));

  const selectedSection = selected.startsWith("s:")
    ? sections.find((s) => s.id === selected.slice(2))
    : undefined;

  const onSectionChange = useCallback(
    (values: SectionFormValues) => {
      if (selectedSection) setSectionDraft({ id: selectedSection.id, values });
    },
    [selectedSection],
  );

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error ?? "İşlem başarısız oldu.");
      else router.refresh();
    });
  }

  const sectionTitle = (section: SectionListEntry) =>
    (section.key && templateByKey[section.key]?.label) || section.title || "(Başlıksız bölüm)";

  // ───────────── Sağ panel ─────────────
  function renderPanel() {
    if (selected === "header") {
      return (
        <Panel title="Header" hint="Logo, site adı ve menü" shared onClose={() => select(firstSelection())}>
          <HeaderBrandingForm
            initialValues={props.branding}
            mediaBaseUrl={theme.mediaBaseUrl}
            onValuesChange={setBrandingDraft}
          />
          <div className="mt-8 space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Menü</p>
              <MenuItemDialog mode="create" parents={props.menuTree.map((n) => ({ id: n.id, label: n.label }))} />
            </div>
            <MenuTree tree={props.menuTree} />
          </div>
        </Panel>
      );
    }

    if (selected === "hero") {
      return (
        <Panel title="Slider" hint="Sayfanın en üstündeki kayan görseller (en fazla 5)" onClose={() => select(firstSelection())}>
          <SlidesPanel
            slides={props.slides}
            mediaBaseUrl={theme.mediaBaseUrl}
            activeIndex={safeHeroIndex}
            onActiveChange={setHeroIndex}
            onDraftChange={setSlideDraft}
          />
        </Panel>
      );
    }

    if (selected === "background") {
      return (
        <Panel
          title="Sayfa Arka Planı"
          hint={isHome ? "Ana sayfaya özel renk ve fotoğraf" : "Bu sayfaya özel renk ve fotoğraf"}
          onClose={() => select(firstSelection())}
        >
          <BackgroundForm
            pageId={pageId}
            initialValues={props.background}
            mediaBaseUrl={theme.mediaBaseUrl}
            onValuesChange={setBackgroundDraft}
          />
        </Panel>
      );
    }

    if (selected === "page" && pageId && props.pageInfo) {
      return (
        <Panel title="Sayfa Bilgileri" hint="Başlık, adres, içerik, SEO ve yayın durumu" onClose={() => select(firstSelection())}>
          <PageInfoForm pageId={pageId} initialData={props.pageInfo} />
        </Panel>
      );
    }

    if (selected === "footer") {
      return (
        <Panel title="Footer" hint="İletişim, sosyal medya, telif" shared onClose={() => select(firstSelection())}>
          <FooterForm initialValues={props.footer} onValuesChange={setFooterDraft} />
        </Panel>
      );
    }

    if (selected === "new") {
      return (
        <Panel title="Yeni Bölüm" hint="Tipini seçip içeriğini girin" onClose={() => select(firstSelection())}>
          <SectionForm
            mode="create"
            mediaBaseUrl={theme.mediaBaseUrl}
            onCancel={() => select(firstSelection())}
            onSubmit={async (values) => {
              const result = await createSectionAction(pageId, values);
              if (!result.success) return result.error;
              router.refresh();
              select(firstSelection());
              return null;
            }}
          />
        </Panel>
      );
    }

    if (selectedSection) {
      const template = selectedSection.key ? templateByKey[selectedSection.key] : undefined;
      const locked = template?.locked ?? false;
      return (
        <Panel
          title={sectionTitle(selectedSection)}
          hint={[SECTION_TYPE_LABELS[selectedSection.type], template?.hint].filter(Boolean).join(" · ")}
          locked={locked}
          onClose={() => select(firstSelection())}
        >
          <SectionForm
            key={selectedSection.id}
            mode="edit"
            lock={locked && template ? { label: template.label } : null}
            fields={template?.fields}
            initialValues={selectedSection.formValues}
            mediaBaseUrl={theme.mediaBaseUrl}
            onValuesChange={onSectionChange}
            onSubmit={async (values) => {
              const result = await updateSectionAction(selectedSection.id, values);
              if (!result.success) return result.error;
              router.refresh();
              return null;
            }}
          />
          {selectedSection.type === "CARDS" && (
            <div className="mt-8 border-t border-border pt-6">
              <InlineItems
                sectionId={selectedSection.id}
                items={selectedSection.items}
                mediaBaseUrl={theme.mediaBaseUrl}
                itemLabel={template?.itemLabel ?? "Kart"}
                fields={template?.itemFields}
              />
            </div>
          )}
        </Panel>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        <MousePointerClick className="size-6" />
        Düzenlemek için soldaki önizlemeden bir bloğa tıklayın.
      </div>
    );
  }

  function firstSelection(): Selection {
    return isHome ? "hero" : "page";
  }

  // ───────────── Önizleme ─────────────
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0 space-y-3">
        {error && (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Tarayıcı çerçevesi */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_20px_50px_-20px_rgba(15,42,68,0.25)]">
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 font-mono text-xs text-neutral-500 ring-1 ring-neutral-200">
              {isHome ? "/" : `/${props.pageInfo?.slug ?? ""}`}
            </span>
            <button
              type="button"
              onClick={() => select("background")}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                selected === "background"
                  ? "border-[#2563eb] bg-blue-50 text-[#2563eb]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-[#2563eb]/50"
              }`}
            >
              <PaintBucket className="size-3.5" />
              Sayfa arka planı
              <span
                aria-hidden="true"
                className="size-3.5 rounded-sm ring-1 ring-black/10"
                style={{ backgroundColor: pageBgColor }}
              />
            </button>
            <span className="hidden text-[11px] font-medium text-neutral-400 sm:block">Önizleme</span>
          </div>

          <div className="relative isolate" style={{ backgroundColor: pageBgColor }}>
            {/* Sayfa arka plan fotoğrafı (doğrulanmış, CSS url() yok) */}
            {pageBgImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pageBgImage} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
            )}
            <CanvasBlock label="Header · ortak" selected={selected === "header"} onSelect={() => select("header")}>
              <PreviewHeader
                theme={theme}
                siteName={branding.siteName}
                logoUrl={branding.logoUrl}
                menu={props.menuTree.map((n) => ({ id: n.id, label: n.label, hasChildren: n.children.length > 0 }))}
              />
            </CanvasBlock>

            {isHome ? (
              <CanvasBlock label="Slider" selected={selected === "hero"} onSelect={() => select("hero")}>
                <PreviewHero
                  theme={theme}
                  slides={previewSlides}
                  index={safeHeroIndex}
                  onIndexChange={setHeroIndex}
                />
              </CanvasBlock>
            ) : (
              <CanvasBlock label="Sayfa Bilgileri" selected={selected === "page"} onSelect={() => select("page")}>
                <PreviewPageTitle theme={theme} title={props.pageInfo?.title ?? ""} content={props.pageInfo?.content ?? ""} />
              </CanvasBlock>
            )}

            {sections.map((section, index) => {
              const template = section.key ? templateByKey[section.key] : undefined;
              const locked = template?.locked ?? false;
              const values = sectionDraft?.id === section.id ? sectionDraft.values : section.formValues;
              const title = sectionTitle(section);

              return (
                <CanvasBlock
                  key={section.id}
                  label={title}
                  muted={!values.active}
                  selected={selected === `s:${section.id}`}
                  onSelect={() => select(`s:${section.id}`)}
                  toolbar={
                    <>
                      <button type="button" className={toolbarButton} aria-label="Yukarı taşı" disabled={isPending || index === 0}
                        onClick={() => { const next = swapIds(ids, index, -1); if (next) run(() => reorderSectionsAction(pageId, next)); }}>
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" className={toolbarButton} aria-label="Aşağı taşı" disabled={isPending || index === sections.length - 1}
                        onClick={() => { const next = swapIds(ids, index, 1); if (next) run(() => reorderSectionsAction(pageId, next)); }}>
                        <ArrowDown className="size-4" />
                      </button>
                      <button type="button" className={toolbarButton} disabled={isPending}
                        aria-label={section.active ? "Gizle" : "Yayına al"}
                        onClick={() => run(() => setSectionActiveAction(section.id, !section.active))}>
                        {section.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      {locked ? (
                        <span className="inline-flex size-7 items-center justify-center" title="Tasarıma bağlı bölüm silinemez">
                          <Lock className="size-3.5" />
                        </span>
                      ) : (
                        <ConfirmDeleteDialog
                          title="Bölümü sil"
                          description={<><strong>{title}</strong> kalıcı olarak silinecek.</>}
                          onConfirm={() => deleteSectionAction(section.id)}
                        />
                      )}
                    </>
                  }
                >
                  <PreviewSection
                    theme={theme}
                    index={index}
                    values={values}
                    items={section.items.map((item) => ({ id: item.id, ...item.formValues }))}
                  />
                </CanvasBlock>
              );
            })}

            {/* Şablonda olup henüz oluşturulmamış bölümler */}
            {props.missing.map((entry) => (
              <div key={entry.key} className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-50 p-5 text-sm text-amber-900">
                <div>
                  <p className="font-semibold">{entry.label}</p>
                  <p className="text-xs opacity-80">Tasarımda yer alıyor, henüz oluşturulmadı.</p>
                </div>
                <CreateTemplateSectionButton pageId={pageId} entry={entry} />
              </div>
            ))}

            {props.allowExtraSections && (
              <button
                type="button"
                onClick={() => select("new")}
                className={`m-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-sm font-semibold transition ${
                  selected === "new"
                    ? "border-[#2563eb] bg-blue-50 text-[#2563eb]"
                    : "border-neutral-300 text-neutral-500 hover:border-[#2563eb]/60 hover:text-[#2563eb]"
                }`}
              >
                <Plus className="size-4" />
                Buraya yeni bölüm ekle
              </button>
            )}

            <CanvasBlock label="Footer · ortak" selected={selected === "footer"} onSelect={() => select("footer")}>
              <PreviewFooter theme={theme} siteName={branding.siteName} values={footer} />
            </CanvasBlock>
          </div>
        </div>
      </div>

      {/* Sağ panel */}
      <aside className="xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto xl:pr-1">
        {renderPanel()}
      </aside>
    </div>
  );
}

function Panel({
  title,
  hint,
  shared = false,
  locked = false,
  onClose,
  children,
}: {
  title: string;
  hint?: string;
  shared?: boolean;
  locked?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-start gap-3 border-b border-border p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Düzenleniyor</p>
          <h2 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold">
            {title}
            {locked && <Lock className="size-4 text-muted-foreground" aria-label="Tasarıma bağlı" />}
          </h2>
          {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
          {shared && (
            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#346872]/10 px-3 py-2 text-xs font-medium text-[#346872]">
              <Link2 className="size-3.5" />
              Bu alan tüm sayfalarda ortaktır; değişiklik her sayfayı etkiler.
            </p>
          )}
        </div>
        <button type="button" onClick={onClose} aria-label="Paneli kapat" className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-muted">
          <X className="size-4" />
        </button>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
