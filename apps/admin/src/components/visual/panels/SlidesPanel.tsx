"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ImageIcon, Plus } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { HeroSlideForm } from "@/components/hero/HeroSlideForm";

import {
  createHeroSlideAction,
  deleteHeroSlideAction,
  reorderHeroSlidesAction,
  setHeroSlideActiveAction,
  updateHeroSlideAction,
} from "@/app/actions/hero-slides";
import type { HeroSlide } from "@/lib/hero-slides";
import { imageUrlSchema } from "@/lib/validations/common";
import { MAX_HERO_SLIDES, type HeroSlideFormValues } from "@/lib/validations/hero-slide.schema";

type SlidesPanelProps = {
  slides: (HeroSlide & { formValues: HeroSlideFormValues })[];
  mediaBaseUrl: string;
  /** Önizlemede gösterilen slayt */
  activeIndex: number;
  onActiveChange: (index: number) => void;
  /** Düzenlenen slaytın canlı değerleri (önizleme için) */
  onDraftChange: (draft: { id: string; values: HeroSlideFormValues } | null) => void;
};

function thumb(value: string | null, base: string) {
  if (!value || !imageUrlSchema.safeParse(value).success) return null;
  return value.startsWith("/media/") ? `${base}${value}` : value;
}

/** Slider slaytları: numarayla sıralama, sayfa içinde düzenleme, en fazla 5 */
export function SlidesPanel({ slides, mediaBaseUrl, activeIndex, onActiveChange, onDraftChange }: SlidesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(slides[activeIndex]?.id ?? null);
  const [creating, setCreating] = useState(false);
  // Sıralama değişince liste anında güncellenir; kayıt arkada yapılır,
  // hata olursa React eski sıraya döner.
  const [orderedSlides, setOptimisticOrder] = useOptimistic(slides, (_current, next: typeof slides) => next);
  const full = slides.length >= MAX_HERO_SLIDES;

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error ?? "İşlem başarısız oldu.");
      else router.refresh();
    });
  }

  // Slaytı seçilen sıraya taşı; diğerleri kendiliğinden kayar
  function moveTo(fromIndex: number, toPosition: number) {
    const next = [...orderedSlides];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toPosition - 1, 0, moved);
    onActiveChange(toPosition - 1);
    setError(null);
    startTransition(async () => {
      setOptimisticOrder(next);
      const result = await reorderHeroSlidesAction(next.map((s) => s.id));
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function toggle(index: number, id: string) {
    const next = openId === id ? null : id;
    setOpenId(next);
    setCreating(false);
    onDraftChange(null);
    if (next) onActiveChange(index);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Slaytlar{" "}
          <span className="font-normal text-muted-foreground">
            ({slides.length}/{MAX_HERO_SLIDES})
          </span>
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <ol className="space-y-2" aria-busy={isPending}>
        {orderedSlides.map((slide, index) => {
          const open = openId === slide.id;
          const src = thumb(slide.imageUrl, mediaBaseUrl);

          return (
            <li
              key={slide.id}
              className={`rounded-xl border bg-surface transition ${
                activeIndex === index ? "border-[#2563eb]/50" : "border-border"
              } ${slide.active ? "" : "opacity-60"}`}
            >
              <div className="flex flex-wrap items-center gap-3 p-2.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  Sıra
                  <select
                    value={index + 1}
                    disabled={isPending}
                    onChange={(event) => moveTo(index, Number(event.target.value))}
                    aria-label={`${slide.title} sırası`}
                    className="h-8 rounded-lg border border-border bg-card px-2 text-sm font-semibold text-foreground"
                  >
                    {orderedSlides.map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(index, slide.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{slide.title}</span>
                    {!slide.active && <span className="text-[11px] text-amber-700">Gizli</span>}
                  </span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                <Switch
                  size="sm"
                  checked={slide.active}
                  disabled={isPending}
                  onCheckedChange={(checked) => run(() => setHeroSlideActiveAction(slide.id, checked))}
                  aria-label={`${slide.title} yayında`}
                />
                <ConfirmDeleteDialog
                  title="Slaytı sil"
                  description={<><strong>{slide.title}</strong> kalıcı olarak silinecek.</>}
                  onConfirm={() => deleteHeroSlideAction(slide.id)}
                />
              </div>

              {open && (
                <div className="border-t border-border p-4">
                  <HeroSlideForm
                    key={slide.id}
                    mode="edit"
                    initialValues={slide.formValues}
                    mediaBaseUrl={mediaBaseUrl}
                    onValuesChange={(values) => onDraftChange({ id: slide.id, values })}
                    onSubmit={async (values) => {
                      const result = await updateHeroSlideAction(slide.id, values);
                      if (!result.success) return result.error;
                      router.refresh();
                      return null;
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {creating ? (
        <div className="rounded-xl border border-dashed border-[#346872]/40 bg-surface p-4">
          <p className="mb-4 text-sm font-semibold">Yeni Slayt</p>
          <HeroSlideForm
            mode="create"
            mediaBaseUrl={mediaBaseUrl}
            submitLabel="Slayt Ekle"
            onCancel={() => setCreating(false)}
            onSubmit={async (values) => {
              const result = await createHeroSlideAction(values);
              if (!result.success) return result.error;
              setCreating(false);
              onActiveChange(slides.length);
              router.refresh();
              return null;
            }}
          />
        </div>
      ) : full ? (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
          En fazla {MAX_HERO_SLIDES} slayt eklenebilir. Yeni slayt için birini silin.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setOpenId(null);
            onDraftChange(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-medium text-[#346872] hover:bg-surface-muted"
        >
          <Plus className="size-4" />
          Slayt Ekle
        </button>
      )}
    </div>
  );
}
