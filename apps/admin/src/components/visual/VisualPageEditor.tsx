"use client";

import { ITEM_CONFIG, hasItems } from "@/lib/section-types";
import {
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
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
type Branding = { siteName: string; logoUrl: string };
import { InlineItems } from "@/components/outline/InlineItems";
import { PageInfoForm } from "@/components/outline/PageInfoForm";
import { CreateTemplateSectionButton } from "@/components/sections/CreateTemplateSectionButton";
import { SectionForm } from "@/components/sections/SectionForm";
import type { SocialLink } from "@/lib/validations/social-link.schema";
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

export type Selection =
  | "hero"
  | "page"
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
  /** Bu ekranda düzenlenen blok (her blok kendi ekranında) */
  block: Selection;
  /** Blok adreslerinin kökü: /pages/home veya /pages/<id> */
  basePath: string;
  allowExtraSections: boolean;
  footer: FooterFormValues;
  socialLinks: SocialLink[];
  headerStyle: { backgroundColor: string; backgroundImage: string; buttonText: string };
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

  const selected = props.block;

  // Kaydedilmemiş canlı değerler (yalnızca seçili blok için)
  const [sectionDrafts, setSectionDrafts] = useState<
    Record<string, SectionFormValues>
  >({});
  const [backgroundDraft, setBackgroundDraft] =
    useState<BackgroundValues | null>(null);
  const [slideDraft, setSlideDraft] = useState<{
    id: string;
    values: HeroSlideFormValues;
  } | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Önizlemede başka bloğa tıklanınca o bloğun ekranına git
  const select = useCallback(
    (next: Selection) => router.push(blockHref(props.basePath, next)),
    [router, props.basePath],
  );

  const branding = props.branding;
  const footer = props.footer;
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
    if (selected === "hero") {
      return (
        <Panel
          title="Slaytlar"
          hint="Sıra numarasıyla sıralayın; en fazla 5 slayt."
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
          title="Arka Plan Ayarları"
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
          title="Genel Sayfa Ayarları"
          hint="Başlık, adres, içerik, SEO ve yayın durumu"
        >
          <PageInfoForm pageId={pageId} initialData={props.pageInfo} />
        </Panel>
      );
    }

    if (selected === "new") {
      return (
        <Panel title="Bölüm Bilgileri" hint="Tipini seçip içeriğini girin">
          <SectionForm
            mode="create"
            mediaBaseUrl={theme.mediaBaseUrl}
            onCancel={() => router.push("/dashboard")}
            onSubmit={async (values) => {
              const result = await createSectionAction(pageId, values);
              if (!result.success) return result.error;
              router.push("/dashboard");
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
              hasItems(selectedSection.type)
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
            {hasItems(selectedSection.type) && (
              <div className="border-t border-border pt-6 2xl:border-l 2xl:border-t-0 2xl:pl-10 2xl:pt-0">
                <InlineItems
                  sectionId={selectedSection.id}
                  items={selectedSection.items}
                  mediaBaseUrl={theme.mediaBaseUrl}
                  itemLabel={template?.itemLabel ?? ITEM_CONFIG[selectedSection.type]?.label ?? "Kart"}
                  fields={template?.itemFields ?? ITEM_CONFIG[selectedSection.type]?.fields}
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
    if (next !== selected) select(next);
  }

  // ───────────── Yerleşim: form (tek blok) + altta isteğe bağlı önizleme ─────────────
  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {renderPanel(selected)}

      {/* Web önizlemesi (isteğe bağlı) */}
      <section className="space-y-4">
        <button
          type="button"
          aria-expanded={showPreview}
          onClick={() => setShowPreview((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold text-(--brand-primary) shadow-sm transition hover:bg-surface-muted"
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
                <SharedPreviewBlock href="/areas/header" label="Header">
                  <PreviewHeader
                    theme={theme}
                    siteName={branding.siteName}
                    logoUrl={branding.logoUrl}
                    style={props.headerStyle}
                    menu={props.menuTree.map((n) => ({
                      id: n.id,
                      label: n.label,
                      icon: n.icon,
                      hasChildren: n.children.length > 0,
                    }))}
                  />
                </SharedPreviewBlock>

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

                <SharedPreviewBlock href="/areas/footer" label="Footer">
                  <PreviewFooter
                    theme={theme}
                    siteName={branding.siteName}
                    values={footer}
                    socialLinks={props.socialLinks}
                  />
                </SharedPreviewBlock>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/** Önizlemede ortak alan (Header/Footer): burada düzenlenmez, kendi ekranına götürür */
function SharedPreviewBlock({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group/shared relative">
      {children}
      <Link
        href={href}
        className="absolute right-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-(--brand-primary) opacity-0 shadow-md ring-1 ring-black/10 transition group-hover/shared:opacity-100 focus-visible:opacity-100"
      >
        <Link2 className="size-3.5" />
        {label} ortak alandır · Düzenle
      </Link>
    </div>
  );
}

/** Bloğun kendi ekranının adresi */
export function blockHref(basePath: string, block: Selection) {
  if (block === "hero") return `${basePath}/slider`;
  if (block === "page") return `${basePath}/bilgiler`;
  if (block === "background") return `${basePath}/arka-plan`;
  if (block === "new") return `${basePath}/yeni-bolum`;
  return `${basePath}/bolum/${block.slice(2)}`;
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
      <header className="flex flex-wrap items-start gap-3 border-b border-border p-5 sm:px-7">
        <div className="min-w-0 flex-1">
          <h2 className="brand-heading flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-(--brand-primary)">
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
            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-(--brand-accent)/10 px-3 py-2 text-xs font-medium text-(--brand-accent)">
              <Link2 className="size-3.5" />
              Bu alan tüm sayfalarda ortaktır; değişiklik her sayfayı etkiler.
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
        )}
      </header>
      <div className="@container p-5 sm:px-7 sm:py-6">{children}</div>
    </section>
  );
}
