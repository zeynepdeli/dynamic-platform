"use client";

import { useState } from "react";
import { useLiveValues } from "@/lib/hooks/use-live-values";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import {
  heroSlideDefaultValues,
  heroSlideSchema,
  type HeroSlideFormValues,
} from "@/lib/validations/hero-slide.schema";

type HeroSlideFormProps = {
  mode: "create" | "edit";
  initialValues?: HeroSlideFormValues;
  mediaBaseUrl: string;
  onSubmit: (values: HeroSlideFormValues) => Promise<string | null>;
  onCancel?: () => void;
  /** Canlı önizleme */
  onValuesChange?: (values: HeroSlideFormValues) => void;
  submitLabel?: string;
};

export function HeroSlideForm({
  mode,
  initialValues,
  mediaBaseUrl,
  onSubmit,
  onCancel,
  onValuesChange,
  submitLabel = "Kaydet",
}: HeroSlideFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: initialValues ?? heroSlideDefaultValues,
  });

  useLiveValues(control, onValuesChange);

  async function submit(values: HeroSlideFormValues) {
    setSubmitError(null);
    setSaved(false);
    const error = await onSubmit(values);
    if (error) {
      setSubmitError(error);
      return;
    }
    if (mode === "edit") {
      reset(values);
      setSaved(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="@container space-y-5"
    >
      <div className="grid gap-5 @xl:grid-cols-2">
        <FormField
          name="title"
          label="Başlık"
          register={register}
          error={errors.title}
          required
        />
        <FormField
          name="subtitle"
          label="Üst Başlık"
          placeholder="ör. Hoş Geldiniz"
          register={register}
          error={errors.subtitle}
        />
      </div>

      <FormTextarea
        name="description"
        label="Açıklama"
        description="Düz metin olarak gösterilir (HTML çalışmaz)."
        rows={3}
        register={register}
        error={errors.description}
      />

      <div className="grid items-start gap-5 @xl:grid-cols-2">
        <ImageUploadField
          name="imageUrl"
          label="Arka Plan Fotoğrafı"
          control={control}
          mediaBaseUrl={mediaBaseUrl}
          description="Geniş görsel önerilir (ör. 1920×800) — en fazla 5 MB."
        />

        <ImageUploadField
          name="mobileImageUrl"
          label="Mobil Fotoğraf (isteğe bağlı)"
          control={control}
          mediaBaseUrl={mediaBaseUrl}
          description="Boşsa masaüstü fotoğrafı kullanılır."
          previewClassName="aspect-[3/4] @md:w-32"
        />
      </div>

      <div className="grid gap-5 @xl:grid-cols-2">
        <FormField
          name="buttonText"
          label="Buton Metni"
          placeholder="ör. Keşfet"
          register={register}
          error={errors.buttonText}
        />
        <FormField
          name="buttonHref"
          label="Buton Bağlantısı"
          placeholder="/hakkimizda"
          description="Site içi adres, / ile başlamalı."
          register={register}
          error={errors.buttonHref}
        />
      </div>

      <FormSwitch
        name="active"
        label="Yayında"
        description="Kapalıysa slayt sitede gösterilmez."
        control={control}
      />

      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {submitError}
        </div>
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
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || (mode === "edit" && !isDirty)}
          className="min-h-10 gap-2 px-5"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSubmitting ? "Kaydediliyor..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
