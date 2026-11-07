"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveValues } from "@/lib/hooks/use-live-values";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2, Palette, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import { updateBrandingAction } from "@/app/actions/appearance";

export type Branding = { siteName: string; logoUrl: string };

/** Header bloğu: site adı + logo (menü ağacı yanına ayrıca verilir) */
export function HeaderBrandingForm({
  initialValues,
  mediaBaseUrl,
  onValuesChange,
}: {
  initialValues: Branding;
  mediaBaseUrl: string;
  /** Canlı önizleme */
  onValuesChange?: (values: Branding) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Branding>({ defaultValues: initialValues });

  useLiveValues(control, onValuesChange);

  async function submit(values: Branding) {
    setError(null);
    setSaved(false);
    const result = await updateBrandingAction(values);
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
      <div className="grid items-start gap-5 @xl:grid-cols-2">
        <FormField
          name="siteName"
          label="Site Adı"
          description="Logo yoksa header'da bu yazı görünür."
          register={register}
          error={errors.siteName}
          required
        />
        <ImageUploadField
          name="logoUrl"
          label="Logo"
          control={control}
          mediaBaseUrl={mediaBaseUrl}
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
        <Link
          href="/appearance"
          className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#346872] hover:underline"
        >
          <Palette className="size-4" />
          Renkler ve arka plan
        </Link>
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
