"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImageIcon, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditModal } from "@/components/common/EditModal";

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

/**
 * Slider slaytları (e-ticaret panelindeki düzen): her slayt tek satır,
 * ekleme ve düzenleme pencerede (modal). En fazla 5 slayt.
 */
export function SlidesPanel({ slides, mediaBaseUrl, activeIndex, onActiveChange, onDraftChange }: SlidesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  /** null: pencere kapalı · "new": yeni slayt · id: düzenlenen */
  const [editing, setEditing] = useState<"new" | string | null>(null);
  // Sıralama değişince liste anında güncellenir; kayıt arkada yapılır,
  // hata olursa React eski sıraya döner.
  const [orderedSlides, setOptimisticOrder] = useOptimistic(slides, (_current, next: typeof slides) => next);
  const full = slides.length >= MAX_HERO_SLIDES;
  const current = editing && editing !== "new" ? slides.find((s) => s.id === editing) : undefined;

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error ?? "İşlem başarısız oldu.");
      else router.refresh();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= orderedSlides.length) return;
    const next = [...orderedSlides];
    [next[index], next[target]] = [next[target], next[index]];
    onActiveChange(target);
    setError(null);
    startTransition(async () => {
      setOptimisticOrder(next);
      const result = await reorderHeroSlidesAction(next.map((s) => s.id));
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function open(target: "new" | string, index?: number) {
    setEditing(target);
    onDraftChange(null);
    if (index !== undefined) onActiveChange(index);
  }

  function close() {
    setEditing(null);
    onDraftChange(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Slaytlar <span className="font-normal text-muted-foreground">({slides.length}/{MAX_HERO_SLIDES})</span>
        </p>
        <Button type="button" onClick={() => open("new")} disabled={full} className="gap-2">
          <Plus className="size-4" /> Slayt Ekle
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {orderedSlides.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Henüz slayt yok. &ldquo;Slayt Ekle&rdquo; ile ilk slaytı ekleyin.
        </p>
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card" aria-busy={isPending}>
          {orderedSlides.map((slide, index) => {
            const src = thumb(slide.imageUrl, mediaBaseUrl);
            return (
              <li
                key={slide.id}
                className={`flex items-center gap-3 px-3 py-2.5 ${activeIndex === index ? "bg-(--brand-accent)/5" : ""} ${slide.active ? "" : "opacity-60"}`}
              >
                <span className="w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                <span className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-5 text-muted-foreground" />
                  )}
                </span>
                <button type="button" onClick={() => open(slide.id, index)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-semibold">{slide.title}</span>
                  {slide.description && (
                    <span className="block truncate text-xs text-muted-foreground">{slide.description}</span>
                  )}
                </button>
                {!slide.active && (
                  <span className="hidden shrink-0 rounded-full bg-neutral-500/10 px-2 py-0.5 text-[11px] font-semibold text-neutral-600 sm:inline">Gizli</span>
                )}
                <Switch
                  size="sm"
                  checked={slide.active}
                  disabled={isPending}
                  onCheckedChange={(checked) => run(() => setHeroSlideActiveAction(slide.id, checked))}
                  aria-label={`${slide.title} yayında`}
                />
                <span className="flex shrink-0">
                  <Button type="button" variant="ghost" size="icon" disabled={isPending || index === 0} onClick={() => move(index, -1)} aria-label={`${slide.title} yukarı taşı`}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" disabled={isPending || index === orderedSlides.length - 1} onClick={() => move(index, 1)} aria-label={`${slide.title} aşağı taşı`}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => open(slide.id, index)} aria-label={`${slide.title} düzenle`}>
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteDialog
                    title="Slaytı sil"
                    description={<><strong>{slide.title}</strong> kalıcı olarak silinecek.</>}
                    onConfirm={() => deleteHeroSlideAction(slide.id)}
                  />
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {full && (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
          En fazla {MAX_HERO_SLIDES} slayt eklenebilir. Yeni slayt için birini silin.
        </p>
      )}

      <EditModal
        open={editing !== null}
        wide
        title={editing === "new" ? "Yeni Slayt" : "Slaytı Düzenle"}
        description={editing === "new" ? "Kaydedince slider'a eklenir." : current?.title}
        onClose={close}
      >
        {editing === "new" ? (
          <HeroSlideForm
            mode="create"
            mediaBaseUrl={mediaBaseUrl}
            submitLabel="Slayt Ekle"
            onCancel={close}
            onSubmit={async (values) => {
              const result = await createHeroSlideAction(values);
              if (!result.success) return result.error;
              close();
              onActiveChange(slides.length);
              router.refresh();
              return null;
            }}
          />
        ) : current ? (
          <HeroSlideForm
            key={current.id}
            mode="edit"
            initialValues={current.formValues}
            mediaBaseUrl={mediaBaseUrl}
            onValuesChange={(values) => onDraftChange({ id: current.id, values })}
            onCancel={close}
            onSubmit={async (values) => {
              const result = await updateHeroSlideAction(current.id, values);
              if (!result.success) return result.error;
              close();
              router.refresh();
              return null;
            }}
          />
        ) : null}
      </EditModal>
    </div>
  );
}
