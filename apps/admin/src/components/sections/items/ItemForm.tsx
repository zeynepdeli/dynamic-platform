"use client";

import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ColorField } from "@/components/forms/ColorField";
import { IconPicker } from "@/components/icons/IconPicker";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import type { FieldConfig, ItemField } from "@/brand/page-templates";
import { fieldLabel } from "@/lib/field-config";
import {
  sectionItemDefaultValues,
  sectionItemSchema,
  type SectionItemFormValues,
} from "@/lib/validations/section.schema";

type ItemFormProps = {
  mode: "create" | "edit";
  fields?: FieldConfig<ItemField>;
  initialValues?: SectionItemFormValues;
  mediaBaseUrl: string;
  onSubmit: (values: SectionItemFormValues) => Promise<string | null>;
  onCancel?: () => void;
  submitLabel?: string;
};

export function ItemForm({
  mode,
  fields,
  initialValues,
  mediaBaseUrl,
  onSubmit,
  onCancel,
  submitLabel = "Kaydet",
}: ItemFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SectionItemFormValues>({
    resolver: zodResolver(sectionItemSchema),
    defaultValues: initialValues ?? sectionItemDefaultValues,
  });

  // Kaydetmeden çıkılırsa uyar
  useUnsavedChanges(isDirty && !isSubmitting);

  async function submit(values: SectionItemFormValues) {
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
    } else {
      reset(sectionItemDefaultValues);
    }
  }

  const label = (name: ItemField, fallback: string) => fieldLabel(fields, name, fallback);

  // Başlık zorunlu alan: gizlenemez, sadece adı değişir
  const titleLabel = label("title", "Başlık") ?? "Başlık";
  const descriptionLabel = label("description", "Açıklama");
  const imageLabel = label("imageUrl", "Görsel");
  const iconLabel = label("icon", "İkon (isteğe bağlı)");
  const colorLabel = label("backgroundColor", "Kart Arka Plan Rengi");
  const bgImageLabel = label("backgroundImage", "Kart Arka Plan Fotoğrafı");
  const buttonTextLabel = label("buttonText", "Buton Metni");
  const buttonHrefLabel = label("buttonHref", "Buton Bağlantısı");

  const canSubmit = !isSubmitting && (mode === "create" || isDirty);

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="@container space-y-5">
      <FormField name="title" label={titleLabel} register={register} error={errors.title} required />

      {descriptionLabel && (
        <FormTextarea
          name="description"
          label={descriptionLabel}
          description="Düz metin olarak gösterilir (HTML çalışmaz)."
          rows={3}
          register={register}
          error={errors.description}
        />
      )}

      {imageLabel && (
        <ImageUploadField name="imageUrl" label={imageLabel} control={control} mediaBaseUrl={mediaBaseUrl} />
      )}

      {iconLabel && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{iconLabel}</p>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <IconPicker kind="menu" allowNone label={iconLabel} value={field.value} onChange={(key) => field.onChange(key)} />
            )}
          />
        </div>
      )}

      {(colorLabel || bgImageLabel) && (
        <div className="grid items-start gap-5 @xl:grid-cols-2">
          {colorLabel && (
            <ColorField
              allowEmpty
              name="backgroundColor"
              label={colorLabel}
              description="Boş bırakılırsa bölüm/tema rengi."
              control={control}
            />
          )}
          {bgImageLabel && (
            <ImageUploadField name="backgroundImage" label={bgImageLabel} control={control} mediaBaseUrl={mediaBaseUrl} />
          )}
        </div>
      )}

      {(buttonTextLabel || buttonHrefLabel) && (
        <div className="grid gap-5 @xl:grid-cols-2">
          {buttonTextLabel && (
            <FormField
              name="buttonText"
              label={buttonTextLabel}
              placeholder="ör. Detaylı Bilgi"
              register={register}
              error={errors.buttonText}
            />
          )}
          {buttonHrefLabel && (
            <FormField
              name="buttonHref"
              label={buttonHrefLabel}
              placeholder="/hizmetler/nakliye"
              description="Site içi adres, / ile başlamalı."
              register={register}
              error={errors.buttonHref}
            />
          )}
        </div>
      )}

      <FormSwitch name="active" label="Yayında" description="Kapalıysa sitede görünmez." control={control} />

      {submitError && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        {saved && !isDirty && (
          <span role="status" className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            Kaydedildi
          </span>
        )}
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            İptal
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit} className="min-h-10 gap-2 px-5">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSubmitting ? "Kaydediliyor..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
