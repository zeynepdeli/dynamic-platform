"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Link2,
  Lock,
  MonitorSmartphone,
  PaintBucket,
  Plus,
} from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { swapIds } from "@/components/common/OrderButtons";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import {
  HeaderBrandingForm,
  type Branding,
} from "@/components/outline/HeaderBlock";
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
import {
  color as safeColor,
  image as safeImage,
  type PreviewTheme,
} from "@/components/visual/preview/safe";

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
import {
  SECTION_TYPE_LABELS,
  type SectionFormValues,
} from "@/lib/validations/section.schema";

type Selection =
  | "header"
  | "hero"
  | "page"
  | "footer"
  | "new"
  | "background"
  | `s:${string}`;

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
  const [sectionDrafts, setSectionDrafts] = useState<
    Record<string, SectionFormValues>
  >({});
  const [showNew, setShowNew] = useState(false);
  const [backgroundDraft, setBackgroundDraft] =
    useState<BackgroundValues | null>(null);
  const [slideDraft, setSlideDraft] = useState<{
    id: string;
    values: HeroSlideFormValues;
  } | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Tüm bloklar alt alta: seçmek = o karta kaydırmak
  const select = useCallback((next: Selection) => {
    setSelected(next);
    if (next === "new") setShowNew(true);
    requestAnimationFrame(() =>
      document
        .getElementById(blockDomId(next))
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, []);

  // Kaydırdıkça üst çubukta görünen bloğu işaretle
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-block]"),
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0]?.target as HTMLElement | undefined;
        if (first?.dataset.block) setSelected(first.dataset.block as Selection);
      },
      { rootMargin: "-150px 0px -55% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections.length, showNew]);

  const branding = brandingDraft ?? props.branding;
  const footer = footerDraft ?? props.footer;
  const background = backgroundDraft ?? props.background;
  const pageBgColor = safeColor(background.backgroundColor) ?? theme.background;
  const pageBgImage = safeImage(background.backgroundImage, theme.mediaBaseUrl);

  // Önizlemedeki slaytlar (düzenlenen slayt canlı değerlerle)
  const previewSlides = props.slides.map((slide) => {
    const v =
      slideDraft?.id === slide.id ? slideDraft.values : slide.formValues;
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
  const safeHeroIndex = Math.min(
    heroIndex,
    Math.max(previewSlides.length - 1, 0),
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
    (section.key && templateByKey[section.key]?.label) ||
    section.title ||
    "(Başlıksız bölüm)";

  // ───────────── Sağ panel ─────────────
  function renderPanel(selected: Selection) {
    if (selected === "header") {
      return (
        <Panel title="Header" hint="Logo, site adı ve menü" shared>
          <HeaderBrandingForm
            initialValues={props.branding}
            mediaBaseUrl={theme.mediaBaseUrl}
            onValuesChange={setBrandingDraft}
          />
          <div className="mt-8 space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Menü</p>
              <MenuItemDialog
                mode="create"
                parents={props.menuTree.map((n) => ({
                  id: n.id,
                  label: n.label,
                }))}
              />
            </div>
            <MenuTree tree={props.menuTree} />
          </div>
        </Panel>
      );
    }

    if (selected === "hero") {
      return (
        <Panel
          title="Slider"
          hint="Sayfanın en üstündeki kayan görseller (en fazla 5)"
        >
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
          title="Genel Görsel Ayarları"
          hint={
            isHome
              ? "Ana sayfaya özel renk ve fotoğraf"
              : "Bu sayfaya özel renk ve fotoğraf"
          }
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
        <Panel
          title="Sayfa Bilgileri"
          hint="Başlık, adres, içerik, SEO ve yayın durumu"
        >
          <PageInfoForm pageId={pageId} initialData={props.pageInfo} />
        </Panel>
      );
    }

    if (selected === "footer") {
      return (
        <Panel title="Footer" hint="İletişim, sosyal medya, telif" shared>
          <FooterForm
            initialValues={props.footer}
            onValuesChange={setFooterDraft}
          />
        </Panel>
      );
    }

    if (selected === "new") {
      return (
        <Panel title="Yeni Bölüm" hint="Tipini seçip içeriğini girin">
          <SectionForm
            mode="create"
            mediaBaseUrl={theme.mediaBaseUrl}
            onCancel={() => setShowNew(false)}
            onSubmit={async (values) => {
              const result = await createSectionAction(pageId, values);
              if (!result.success) return result.error;
              router.refresh();
              setShowNew(false);
              return null;
            }}
          />
        </Panel>
      );
    }

    const selectedSection = selected.startsWith("s:")
      ? sections.find((s) => s.id === selected.slice(2))
      : undefined;
    if (selectedSection) {
      const template = selectedSection.key
        ? templateByKey[selectedSection.key]
        : undefined;
      const locked = template?.locked ?? false;
      return (
        <Panel
          title={sectionTitle(selectedSection)}
          hint={[SECTION_TYPE_LABELS[selectedSection.type], template?.hint]
            .filter(Boolean)
            .join(" · ")}
          locked={locked}
          actions={sectionActions(
            selectedSection,
            sections.indexOf(selectedSection),
            locked,
          )}
        >
          <div
            className={
              selectedSection.type === "CARDS"
                ? "grid gap-10 2xl:grid-cols-2"
                : ""
            }
          >
            <SectionForm
              key={selectedSection.id}
              mode="edit"
              lock={locked && template ? { label: template.label } : null}
              fields={template?.fields}
              initialValues={selectedSection.formValues}
              mediaBaseUrl={theme.mediaBaseUrl}
              onValuesChange={(values) =>
                setSectionDrafts((d) => ({
                  ...d,
                  [selectedSection.id]: values,
                }))
              }
              onSubmit={async (values) => {
                const result = await updateSectionAction(
                  selectedSection.id,
                  values,
                );
                if (!result.success) return result.error;
                router.refresh();
                return null;
              }}
            />
            {selectedSection.type === "CARDS" && (
              <div className="border-t border-border pt-6 2xl:border-l 2xl:border-t-0 2xl:pl-10 2xl:pt-0">
                <InlineItems
                  sectionId={selectedSection.id}
                  items={selectedSection.items}
                  mediaBaseUrl={theme.mediaBaseUrl}
                  itemLabel={template?.itemLabel ?? "Kart"}
                  fields={template?.itemFields}
                />
              </div>
            )}
          </div>
        </Panel>
      );
    }

    return null;
  }

  // Bölüm işlemleri (form başlığında ve önizlemede ortak)
  function sectionActions(
    section: SectionListEntry,
    index: number,
    locked: boolean,
  ) {
    const title = sectionTitle(section);
    return (
      <>
        <button
          type="button"
          className={toolbarButton}
          aria-label="Yukarı taşı"
          title="Yukarı taşı"
          disabled={isPending || index === 0}
          onClick={() => {
            const next = swapIds(ids, index, -1);
            if (next) run(() => reorderSectionsAction(pageId, next));
          }}
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          className={toolbarButton}
          aria-label="Aşağı taşı"
          title="Aşağı taşı"
          disabled={isPending || index === sections.length - 1}
          onClick={() => {
            const next = swapIds(ids, index, 1);
            if (next) run(() => reorderSectionsAction(pageId, next));
          }}
        >
          <ArrowDown className="size-4" />
        </button>
        <button
          type="button"
          className={toolbarButton}
          disabled={isPending}
          aria-label={section.active ? "Gizle" : "Yayına al"}
          title={section.active ? "Sitede gizle" : "Yayına al"}
          onClick={() =>
            run(() => setSectionActiveAction(section.id, !section.active))
          }
        >
          {section.active ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </button>
        {locked ? (
          <span
            className="inline-flex size-7 items-center justify-center"
            title="Tasarıma bağlı bölüm silinemez"
          >
            <Lock className="size-3.5" />
          </span>
        ) : (
          <ConfirmDeleteDialog
            title="Bölümü sil"
            description={
              <>
                <strong>{title}</strong> kalıcı olarak silinecek.
              </>
            }
            onConfirm={() => deleteSectionAction(section.id)}
          />
        )}
      </>
    );
  }

  // Önizlemeden seçilince formun başına kaydır
  function selectAndScroll(next: Selection) {
    select(next);
  }

  // ───────────── Yerleşim: üstte bölüm seçici, ortada form, altta önizleme ─────────────
  const navItems: {
    id: Selection;
    label: string;
    hidden?: boolean;
    shared?: boolean;
    icon?: React.ReactNode;
  }[] = [
    { id: "header", label: "Header", shared: true },
    isHome
      ? { id: "hero", label: "Slider" }
      : { id: "page", label: "Sayfa Bilgileri" },
    ...sections.map((section) => ({
      id: `s:${section.id}` as Selection,
      label: sectionTitle(section),
      hidden: !section.active,
    })),
    { id: "footer", label: "Footer", shared: true },
  ];

  return (
    <div className="space-y-6">
      {/* Bölüm seçici (sayfadaki sırayla) */}
      <nav
        aria-label="Sayfa bölümleri"
        className="sticky top-16 z-30 -mx-1 overflow-x-auto rounded-2xl border border-border bg-card/95 p-2 shadow-sm backdrop-blur"
      >
        <ol className="flex min-w-max items-center gap-1.5">
          {navItems.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={selected === item.id ? "step" : undefined}
                onClick={() => select(item.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  selected === item.id
                    ? "bg-[#183350] text-white shadow-sm"
                    : "text-foreground hover:bg-surface-muted"
                } ${item.hidden ? "opacity-60" : ""}`}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-md text-[11px] font-bold ${
                    selected === item.id
                      ? "bg-white/20"
                      : "bg-[#183350]/10 text-[#183350]"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="max-w-44 truncate">{item.label}</span>
                {item.shared && (
                  <Link2
                    className="size-3.5 opacity-60"
                    aria-label="Tüm sayfalarda ortak"
                  />
                )}
                {item.hidden && (
                  <EyeOff className="size-3.5 opacity-70" aria-label="Gizli" />
                )}
              </button>
            </li>
          ))}

          <li aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
          <li>
            <button
              type="button"
              onClick={() => select("background")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                selected === "background"
                  ? "bg-[#183350] text-white"
                  : "hover:bg-surface-muted"
              }`}
            >
              <PaintBucket className="size-4" />
              Arka plan
              <span
                aria-hidden="true"
                className="size-3.5 rounded-sm ring-1 ring-black/10"
                style={{ backgroundColor: pageBgColor }}
              />
            </button>
          </li>
          {props.allowExtraSections && (
            <li>
              <button
                type="button"
                onClick={() => select("new")}
                className={`flex items-center gap-2 rounded-xl border border-dashed px-3.5 py-2 text-sm font-medium transition ${
                  selected === "new"
                    ? "border-[#183350] bg-[#183350] text-white"
                    : "border-border text-[#346872] hover:bg-surface-muted"
                }`}
              >
                <Plus className="size-4" />
                Yeni bölüm
              </button>
            </li>
          )}
        </ol>
      </nav>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Şablonda olup henüz oluşturulmamış bölümler */}
      {props.missing.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/50 bg-amber-50 p-4 text-sm text-amber-900">
          <span className="font-semibold">Tasarımın beklediği bölümler:</span>
          {props.missing.map((entry) => (
            <span
              key={entry.key}
              className="flex items-center gap-2 rounded-xl bg-white/70 py-1 pl-3 pr-1"
            >
              {entry.label}
              <CreateTemplateSectionButton pageId={pageId} entry={entry} />
            </span>
          ))}
        </div>
      )}

      {/* Tüm bloklar alt alta (sayfadaki sırayla) */}
      <div className="space-y-6">
        {(["background", ...navItems.map((i) => i.id)] as Selection[]).map(
          (id) => (
            <div
              key={id}
              id={blockDomId(id)}
              data-block={id}
              className="scroll-mt-36"
            >
              {renderPanel(id)}
            </div>
          ),
        )}

        {props.allowExtraSections &&
          (showNew ? (
            <div
              id={blockDomId("new")}
              data-block="new"
              className="scroll-mt-36"
            >
              {renderPanel("new")}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => select("new")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-sm font-semibold text-[#346872] transition hover:border-[#346872] hover:bg-card"
            >
              <Plus className="size-4" />
              Yeni bölüm ekle
            </button>
          ))}
      </div>

      {/* Web önizlemesi (isteğe bağlı) */}
      <section className="space-y-4">
        <button
          type="button"
          aria-expanded={showPreview}
          onClick={() => setShowPreview((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold text-[#183350] shadow-sm transition hover:bg-surface-muted"
        >
          <MonitorSmartphone className="size-4" />
          {showPreview
            ? "Önizlemeyi gizle"
            : "Web\u2019de nasıl görünüyor? Önizlemeyi aç"}
          <ChevronDown
            className={`size-4 transition-transform ${showPreview ? "rotate-180" : ""}`}
          />
        </button>

        {showPreview && (
          <>
            <p className="text-center text-xs text-muted-foreground">
              Önizleme formdaki değişikliklerle anında güncellenir. Bir alana
              tıklayarak onu düzenleyebilirsiniz.
            </p>
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
                  onClick={() => selectAndScroll("background")}
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
                <span className="hidden text-[11px] font-medium text-neutral-400 sm:block">
                  Önizleme
                </span>
              </div>

              <div
                className="relative isolate"
                style={{ backgroundColor: pageBgColor }}
              >
                {/* Sayfa arka plan fotoğrafı (doğrulanmış, CSS url() yok) */}
                {pageBgImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pageBgImage}
                    alt=""
                    className="absolute inset-0 -z-10 size-full object-cover"
                  />
                )}
                <CanvasBlock
                  label="Header · ortak"
                  selected={selected === "header"}
                  onSelect={() => selectAndScroll("header")}
                >
                  <PreviewHeader
                    theme={theme}
                    siteName={branding.siteName}
                    logoUrl={branding.logoUrl}
                    menu={props.menuTree.map((n) => ({
                      id: n.id,
                      label: n.label,
                      hasChildren: n.children.length > 0,
                    }))}
                  />
                </CanvasBlock>

                {isHome ? (
                  <CanvasBlock
                    label="Slider"
                    selected={selected === "hero"}
                    onSelect={() => selectAndScroll("hero")}
                  >
                    <PreviewHero
                      theme={theme}
                      slides={previewSlides}
                      index={safeHeroIndex}
                      onIndexChange={setHeroIndex}
                    />
                  </CanvasBlock>
                ) : (
                  <CanvasBlock
                    label="Sayfa Bilgileri"
                    selected={selected === "page"}
                    onSelect={() => selectAndScroll("page")}
                  >
                    <PreviewPageTitle
                      theme={theme}
                      title={props.pageInfo?.title ?? ""}
                      content={props.pageInfo?.content ?? ""}
                    />
                  </CanvasBlock>
                )}

                {sections.map((section, index) => {
                  const template = section.key
                    ? templateByKey[section.key]
                    : undefined;
                  const locked = template?.locked ?? false;
                  const values = sectionDrafts[section.id]
                    ? sectionDrafts[section.id]
                    : section.formValues;
                  const title = sectionTitle(section);

                  return (
                    <CanvasBlock
                      key={section.id}
                      label={title}
                      muted={!values.active}
                      selected={selected === `s:${section.id}`}
                      onSelect={() => selectAndScroll(`s:${section.id}`)}
                      toolbar={sectionActions(section, index, locked)}
                    >
                      <PreviewSection
                        theme={theme}
                        index={index}
                        values={values}
                        items={section.items.map((item) => ({
                          id: item.id,
                          ...item.formValues,
                        }))}
                      />
                    </CanvasBlock>
                  );
                })}

                {/* Şablonda olup henüz oluşturulmamış bölümler */}
                {props.missing.map((entry) => (
                  <div
                    key={entry.key}
                    className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-50 p-5 text-sm text-amber-900"
                  >
                    <div>
                      <p className="font-semibold">{entry.label}</p>
                      <p className="text-xs opacity-80">
                        Tasarımda yer alıyor, henüz oluşturulmadı.
                      </p>
                    </div>
                    <CreateTemplateSectionButton
                      pageId={pageId}
                      entry={entry}
                    />
                  </div>
                ))}

                {props.allowExtraSections && (
                  <button
                    type="button"
                    onClick={() => selectAndScroll("new")}
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

                <CanvasBlock
                  label="Footer · ortak"
                  selected={selected === "footer"}
                  onSelect={() => selectAndScroll("footer")}
                >
                  <PreviewFooter
                    theme={theme}
                    siteName={branding.siteName}
                    values={footer}
                  />
                </CanvasBlock>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function blockDomId(id: string) {
  return `blok-${id.replace(/[^a-zA-Z0-9-]/g, "-")}`;
}

function Panel({
  title,
  hint,
  shared = false,
  locked = false,
  actions,
  children,
}: {
  title: string;
  hint?: string;
  shared?: boolean;
  locked?: boolean;
  /** Başlık satırındaki butonlar (sırala, gizle, sil) */
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-start gap-3 border-b border-border p-5 sm:px-8">
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            {title}
            {locked && (
              <Lock
                className="size-4 text-muted-foreground"
                aria-label="Tasarıma bağlı"
              />
            )}
          </h2>
          {hint && (
            <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
          )}
          {shared && (
            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#346872]/10 px-3 py-2 text-xs font-medium text-[#346872]">
              <Link2 className="size-3.5" />
              Bu alan tüm sayfalarda ortaktır; değişiklik her sayfayı etkiler.
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
        )}
      </header>
      <div className="@container p-5 sm:p-8">{children}</div>
    </section>
  );
}
