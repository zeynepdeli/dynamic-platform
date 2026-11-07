"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, PanelsTopLeft } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { OrderButtons, swapIds } from "@/components/common/OrderButtons";
import { HeroSlideDialog } from "@/components/hero/HeroSlideDialog";

import {
  deleteHeroSlideAction,
  reorderHeroSlidesAction,
  setHeroSlideActiveAction,
} from "@/app/actions/hero-slides";
import type { HeroSlide } from "@/lib/hero-slides";
import { imageUrlSchema } from "@/lib/validations/common";
import type { HeroSlideFormValues } from "@/lib/validations/hero-slide.schema";

type HeroSlideListProps = {
  slides: (HeroSlide & { formValues: HeroSlideFormValues })[];
  mediaBaseUrl: string;
};

function previewSrc(value: string | null, mediaBaseUrl: string) {
  if (!value || !imageUrlSchema.safeParse(value).success) return null;
  return value.startsWith("/media/") ? `${mediaBaseUrl}${value}` : value;
}

export function HeroSlideList({ slides, mediaBaseUrl }: HeroSlideListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "İşlem başarısız oldu.");
        return;
      }
      router.refresh();
    });
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <PanelsTopLeft className="size-8" />
        <p>Henüz slider yok.</p>
      </div>
    );
  }

  const ids = slides.map((slide) => slide.id);

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <ol className="space-y-3" aria-busy={isPending}>
        {slides.map((slide, index) => {
          const src = previewSrc(slide.imageUrl, mediaBaseUrl);

          return (
            <li
              key={slide.id}
              className={`flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center ${slide.active ? "" : "opacity-60"}`}
            >
              <OrderButtons
                index={index}
                total={slides.length}
                disabled={isPending}
                onMove={(dir) => {
                  const next = swapIds(ids, index, dir);
                  if (next) run(() => reorderHeroSlidesAction(next));
                }}
              />

              <div className="flex aspect-[16/7] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-muted sm:w-40">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-5 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {slide.subtitle && (
                  <p className="truncate text-xs text-muted-foreground">
                    {slide.subtitle}
                  </p>
                )}
                <p className="truncate font-semibold">{slide.title}</p>
                {slide.buttonText && (
                  <p className="truncate text-xs text-muted-foreground">
                    Buton: {slide.buttonText} →{" "}
                    <span className="font-mono">{slide.buttonHref}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={slide.active}
                    disabled={isPending}
                    onCheckedChange={(checked) =>
                      run(() => setHeroSlideActiveAction(slide.id, checked))
                    }
                    aria-label={`${slide.title} yayında`}
                  />
                  {slide.active ? "Yayında" : "Gizli"}
                </label>

                <HeroSlideDialog
                  mode="edit"
                  slideId={slide.id}
                  initialValues={slide.formValues}
                  mediaBaseUrl={mediaBaseUrl}
                />

                <ConfirmDeleteDialog
                  title="Slider'ı sil"
                  description={
                    <>
                      <strong>{slide.title}</strong> kalıcı olarak silinecek.
                    </>
                  }
                  onConfirm={() => deleteHeroSlideAction(slide.id)}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
