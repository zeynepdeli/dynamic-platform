"use client";

import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { useState } from "react";
import { useLiveValues } from "@/lib/hooks/use-live-values";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ColorField } from "@/components/forms/ColorField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import type { FieldConfig, SectionField } from "@/brand/page-templates";
import { fieldLabel } from "@/lib/field-config";
import {
  SECTION_TYPES,
  SECTION_TYPE_LABELS,
  sectionDefaultValues,
  sectionSchema,
  type SectionFormValues,
} from "@/lib/validations/section.schema";

export type SectionLock = {
  /** Şablondaki isim (ör. "Vizyonumuz") */
  label: string;
};

type SectionFormProps = {
  mode: "create" | "edit";
  /** Şablona bağlı kilitli bölüm: tip ve anahtar değiştirilemez */
  lock?: SectionLock | null;
  /** Şablondaki alan adları / gizli alanlar */
  fields?: FieldConfig<SectionField>;
  initialValues?: SectionFormValues;
  mediaBaseUrl: string;
  /** Hata mesajı döndürürse gösterilir; null = başarılı */
  onSubmit: (values: SectionFormValues) => Promise<string | null>;
  /** Canlı önizleme: form değiştikçe çağrılır */
  onValuesChange?: (values: SectionFormValues) => void;
  /** Pencere içinde kullanılırken "İptal" butonu */
  onCancel?: () => void;
};

const COLUMN_OPTIONS = [1, 2, 3, 4] as const;

export function SectionForm({
  mode,
  lock = null,
  fields,
  initialValues,
  mediaBaseUrl,
  onSubmit,
  onValuesChange,
  onCancel,
}: SectionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: initialValues ?? sectionDefaultValues,
  });

  // Kaydetmeden çıkılırsa uyar
  useUnsavedChanges(isDirty && !isSubmitting);

  // Canlı önizleme: her değişiklikte üst bileşene bildir
  useLiveValues(control, onValuesChange);

  const type = useWatch({ control, name: "type" });
  const columns = useWatch({ control, name: "columns" });

  async function submit(values: SectionFormValues) {
    setSubmitError(null);
    setSaved(false);
    const error = await onSubmit(values);
    if (error) {
      setSubmitError(error);
      return;
    }
    // Sayfa içi formda "kaydedildi" durumunu göster
    if (mode === "edit") {
      reset(values);
      setSaved(true);
    }
  }

  const label = (name: SectionField, fallback: string) =>
    fieldLabel(fields, name, fallback);

  const titleLabel = label("title", "Başlık");
  const subtitleLabel = label("subtitle", "Alt Başlık");
  const bodyLabel = label("body", type === "CARDS" ? "Giriş Metni" : "Metin");
  const bgColorLabel = label("backgroundColor", "Arka Plan Rengi");
  const textColorLabel = label("textColor", "Yazı Rengi");
  const imageLabel = label(
    "backgroundImage",
    type === "IMAGE_TEXT" ? "Görsel" : "Arka Plan Görseli",
  );
  const buttonTextLabel = label("buttonText", "Buton Metni");
  const buttonHrefLabel = label("buttonHref", "Buton Bağlantısı");
  const columnsLabel = label("columns", "Sütun Sayısı (masaüstü)");

  const canSubmit = !isSubmitting && (mode === "create" || isDirty);

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="@container space-y-6">
      {/* Bölüm tipi (şablona bağlı bölümlerde gizli) */}
      {!lock && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Bölüm Tipi</p>
          <div
            role="radiogroup"
            aria-label="Bölüm tipi"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {SECTION_TYPES.map((option) => {
              const active = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue("type", option, { shouldDirty: true })}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  {SECTION_TYPE_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(titleLabel || subtitleLabel) && (
        <div className="grid gap-5 @xl:grid-cols-2">
          {titleLabel && (
            <FormField name="title" label={titleLabel} register={register} error={errors.title} />
          )}
          {subtitleLabel && (
            <FormField name="subtitle" label={subtitleLabel} register={register} error={errors.subtitle} />
          )}
        </div>
      )}

      {bodyLabel && (
        <FormTextarea
          name="body"
          label={bodyLabel}
          description="Düz metin olarak gösterilir (HTML çalışmaz)."
          rows={4}
          register={register}
          error={errors.body}
        />
      )}

      {imageLabel && (
        <ImageUploadField
          name="backgroundImage"
          label={imageLabel}
          control={control}
          mediaBaseUrl={mediaBaseUrl}
        />
      )}

      {type === "CARDS" && columnsLabel && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{columnsLabel}</p>
          <div role="radiogroup" aria-label={columnsLabel} className="flex gap-2">
            {COLUMN_OPTIONS.map((option) => {
              const active = columns === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue("columns", option, { shouldDirty: true })}
                  className={`size-11 rounded-xl border text-sm font-semibold transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(bgColorLabel || textColorLabel) && (
        <div className="grid gap-5 @xl:grid-cols-2">
          {bgColorLabel && (
            <ColorField
              allowEmpty
              name="backgroundColor"
              label={bgColorLabel}
              description="Boş bırakılırsa tema rengi kullanılır."
              control={control}
            />
          )}
          {textColorLabel && (
            <ColorField
              allowEmpty
              name="textColor"
              label={textColorLabel}
              description="Boş bırakılırsa otomatik."
              control={control}
            />
          )}
        </div>
      )}

      {(buttonTextLabel || buttonHrefLabel) && (
        <div className="grid gap-5 @xl:grid-cols-2">
          {buttonTextLabel && (
            <FormField
              name="buttonText"
              label={buttonTextLabel}
              placeholder="ör. Teklif Al"
              register={register}
              error={errors.buttonText}
            />
          )}
          {buttonHrefLabel && (
            <FormField
              name="buttonHref"
              label={buttonHrefLabel}
              placeholder="/iletisim"
              description="Site içi adres, / ile başlamalı."
              register={register}
              error={errors.buttonHref}
            />
          )}
        </div>
      )}

      {/* Geliştirici alanı: frontend bölümü bu anahtarla bulur */}
      {!lock && (
        <FormField
          name="key"
          label="Anahtar (geliştirici için, isteğe bağlı)"
          placeholder="ör. hizmetler"
          description="Özel tasarımlı sayfalarda bölümü bulmak için kullanılır."
          register={register}
          error={errors.key}
        />
      )}

      <FormSwitch
        name="active"
        label="Yayında"
        description="Kapalıysa bölüm sitede görünmez."
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

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
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
        <Button type="submit" disabled={!canSubmit} className="min-h-11 gap-2 px-5">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
