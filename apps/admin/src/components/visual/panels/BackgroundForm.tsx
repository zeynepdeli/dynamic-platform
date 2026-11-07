"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveValues } from "@/lib/hooks/use-live-values";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/forms/ColorField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import {
  updatePageBackgroundAction,
  type BackgroundValues,
} from "@/app/actions/background";

/** Sayfaya özel arka plan: renk ve/veya fotoğraf (boş = sitenin genel arka planı) */
export function BackgroundForm({
  pageId,
  initialValues,
  mediaBaseUrl,
  onValuesChange,
}: {
  pageId: string | null;
  initialValues: BackgroundValues;
  mediaBaseUrl: string;
  onValuesChange?: (values: BackgroundValues) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<BackgroundValues>({ defaultValues: initialValues });

  useLiveValues(control, onValuesChange);

  async function submit(values: BackgroundValues) {
    setError(null);
    setSaved(false);
    const result = await updatePageBackgroundAction(pageId, values);
    if (!result.success) {
      setError(result.error);
      return;
    }
    reset(values);
    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="@container space-y-5"
    >
      <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
        Boş bırakırsanız sitenin genel arka planı (Renkler &amp; Logo)
        kullanılır. Fotoğraf seçerseniz renk, fotoğraf yüklenirken görünür.
      </p>

      <div className="grid items-start gap-5 @xl:grid-cols-2">
        <ColorField
          allowEmpty
          name="backgroundColor"
          label="Arka Plan Rengi"
          control={control}
        />

        <ImageUploadField
          name="backgroundImage"
          label="Arka Plan Fotoğrafı"
          control={control}
          mediaBaseUrl={mediaBaseUrl}
          description="Geniş görsel önerilir (ör. 1920×1080) — en fazla 5 MB."
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        {saved && !isDirty && (
          <span
            role="status"
            className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700"
          >
            <CheckCircle2 className="size-4" />
            Kaydedildi
          </span>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-h-10 gap-2 px-5"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
