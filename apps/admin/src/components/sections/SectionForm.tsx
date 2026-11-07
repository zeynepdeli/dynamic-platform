"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ColorField } from "@/components/forms/ColorField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

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
  initialValues?: SectionFormValues;
  mediaBaseUrl: string;
  onSubmit: (values: SectionFormValues) => Promise<string | null>;
  onCancel: () => void;
};

const COLUMN_OPTIONS = [1, 2, 3, 4] as const;

export function SectionForm({
  mode,
  lock = null,
  initialValues,
  mediaBaseUrl,
  onSubmit,
  onCancel,
}: SectionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: initialValues ?? sectionDefaultValues,
  });

  const type = useWatch({ control, name: "type" });
  const columns = useWatch({ control, name: "columns" });

  async function submit(values: SectionFormValues) {
    setSubmitError(null);
    // onSubmit hata mesajı döndürürse göster, null ise başarılı
    const error = await onSubmit(values);
    if (error) setSubmitError(error);
  }

  const canSubmit = !isSubmitting && (mode === "create" || isDirty);

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      {lock && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-semibold text-primary">{lock.label}</p>
          <p className="mt-1 text-muted-foreground">
            Bu bölüm site tasarımına bağlıdır. İçeriğini düzenleyebilirsiniz;
            tipi değiştirilemez.
          </p>
        </div>
      )}

      {/* Bölüm tipi (kilitli bölümlerde gizli) */}
      <div className={lock ? "hidden" : "space-y-2"}>
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
                onClick={() =>
                  setValue("type", option, { shouldDirty: true })
                }
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

      {/* İçerik */}
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          name="title"
          label="Başlık"
          placeholder="Örn: Hizmetlerimiz"
          register={register}
          error={errors.title}
        />
        <FormField
          name="subtitle"
          label="Alt Başlık"
          register={register}
          error={errors.subtitle}
        />
      </div>

      <FormTextarea
        name="body"
        label={type === "CARDS" ? "Giriş Metni" : "Metin"}
        description="Düz metin olarak gösterilir (HTML çalışmaz)."
        rows={4}
        register={register}
        error={errors.body}
      />

      {type === "CARDS" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Sütun Sayısı (masaüstü)</p>
          <div role="radiogroup" aria-label="Sütun sayısı" className="flex gap-2">
            {COLUMN_OPTIONS.map((option) => {
              const active = columns === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() =>
                    setValue("columns", option, { shouldDirty: true })
                  }
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

      {/* Görünüm */}
      <div className="grid gap-5 md:grid-cols-2">
        <ColorField
          name="backgroundColor"
          label="Arka Plan Rengi"
          description="Boş bırakılırsa tema rengi kullanılır."
          control={control}
        />
        <ColorField
          name="textColor"
          label="Yazı Rengi"
          description="Boş bırakılırsa otomatik."
          control={control}
        />
      </div>

      <ImageUploadField
        name="backgroundImage"
        label={type === "IMAGE_TEXT" ? "Görsel" : "Arka Plan Görseli"}
        control={control}
        mediaBaseUrl={mediaBaseUrl}
      />

      {/* Buton */}
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          name="buttonText"
          label="Buton Metni"
          placeholder="Örn: Teklif Al"
          register={register}
          error={errors.buttonText}
        />
        <FormField
          name="buttonHref"
          label="Buton Bağlantısı"
          placeholder="/iletisim"
          description="Site içi adres, / ile başlamalı."
          register={register}
          error={errors.buttonHref}
        />
      </div>

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

      <div className="flex justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={!canSubmit} className="min-h-11 gap-2 px-5">
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
