"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  PaintBucket,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { ColorField } from "@/components/forms/ColorField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { AppearancePreview } from "@/components/appearance/AppearancePreview";

import { updateAppearanceAction } from "@/app/actions/appearance";
import {
  appearanceSchema,
  type AppearanceFormValues,
} from "@/lib/validations/appearance.schema";

type AppearanceFormProps = {
  initialValues: AppearanceFormValues;
  mediaBaseUrl: string;
};

const backgroundOptions = [
  { value: "COLOR", label: "Düz Renk", icon: PaintBucket },
  { value: "IMAGE", label: "Görsel", icon: ImageIcon },
] as const;

export function AppearanceForm({
  initialValues,
  mediaBaseUrl,
}: AppearanceFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: initialValues,
  });

  // Canlı önizleme için tüm form değerlerini izle
  const values = useWatch({ control }) as AppearanceFormValues;
  const backgroundType = values.backgroundType;

  async function onSubmit(formValues: AppearanceFormValues) {
    setSubmitError(null);
    setSaved(false);

    const result = await updateAppearanceAction(formValues);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    reset(formValues); // isDirty sıfırlansın
    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_420px]"
    >
      <div className="space-y-7">
        {/* ───── Genel ───── */}
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Site Kimliği</h2>
          <p className="-mt-3 text-sm text-muted-foreground">
            Site adı ve logo Header ekranından düzenlenir.
          </p>

          <FormTextarea
            name="description"
            label="Site Açıklaması"
            rows={3}
            register={register}
            error={errors.description}
          />

          <ImageUploadField
            name="faviconUrl"
            label="Favicon"
            control={control}
            mediaBaseUrl={mediaBaseUrl}
            description="Kare görsel önerilir (ör. 512×512)."
            previewClassName="aspect-square @md:w-24"
          />
        </section>

        {/* ───── Renkler ───── */}
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Tema Renkleri</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <ColorField
              name="primaryColor"
              label="Ana Renk"
              description="Üst menü, başlıklar"
              control={control}
            />
            <ColorField
              name="secondaryColor"
              label="İkincil Renk"
              description="Butonlar, vurgular"
              control={control}
            />
          </div>
        </section>

        {/* ───── Arka plan ───── */}
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Arka Plan</h2>

          <div
            role="radiogroup"
            aria-label="Arka plan tipi"
            className="grid grid-cols-2 gap-3"
          >
            {backgroundOptions.map((option) => {
              const Icon = option.icon;
              const active = backgroundType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() =>
                    setValue("backgroundType", option.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="size-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <ColorField
            name="backgroundColor"
            label="Arka Plan Rengi"
            description={
              backgroundType === "IMAGE"
                ? "Görsel yüklenirken görünen renk"
                : undefined
            }
            control={control}
          />

          {backgroundType === "IMAGE" && (
            <ImageUploadField
              name="backgroundImage"
              label="Arka Plan Görseli"
              control={control}
              mediaBaseUrl={mediaBaseUrl}
              description="Geniş görsel önerilir (ör. 1920×1080) — en fazla 5 MB."
              required
            />
          )}
        </section>

        {/* ───── SEO ───── */}
        <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Varsayılan SEO</h2>

          <FormField
            name="metaTitle"
            label="Meta Başlık"
            register={register}
            error={errors.metaTitle}
          />
          <FormTextarea
            name="metaDescription"
            label="Meta Açıklama"
            rows={3}
            register={register}
            error={errors.metaDescription}
          />
        </section>
      </div>

      {/* ───── Önizleme + kaydet ───── */}
      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <p className="text-sm font-medium text-muted-foreground">
          Canlı Önizleme
        </p>

        <AppearancePreview values={values} mediaBaseUrl={mediaBaseUrl} />

        {submitError && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {submitError}
          </div>
        )}

        {saved && !isDirty && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 className="size-4" />
            Ayarlar kaydedildi.
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-h-11 w-full gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </aside>
    </form>
  );
}
