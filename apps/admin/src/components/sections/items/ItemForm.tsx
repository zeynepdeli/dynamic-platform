"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { ColorField } from "@/components/forms/ColorField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import {
  sectionItemDefaultValues,
  sectionItemSchema,
  type SectionItemFormValues,
} from "@/lib/validations/section.schema";

type ItemFormProps = {
  mode: "create" | "edit";
  initialValues?: SectionItemFormValues;
  mediaBaseUrl: string;
  onSubmit: (values: SectionItemFormValues) => Promise<string | null>;
  onCancel: () => void;
};

export function ItemForm({
  mode,
  initialValues,
  mediaBaseUrl,
  onSubmit,
  onCancel,
}: ItemFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SectionItemFormValues>({
    resolver: zodResolver(sectionItemSchema),
    defaultValues: initialValues ?? sectionItemDefaultValues,
  });

  async function submit(values: SectionItemFormValues) {
    setSubmitError(null);
    const error = await onSubmit(values);
    if (error) setSubmitError(error);
  }

  const canSubmit = !isSubmitting && (mode === "create" || isDirty);

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      <FormField
        name="title"
        label="Kart Başlığı"
        register={register}
        error={errors.title}
        required
      />

      <FormTextarea
        name="description"
        label="Açıklama"
        description="Düz metin olarak gösterilir (HTML çalışmaz)."
        rows={3}
        register={register}
        error={errors.description}
      />

      <ImageUploadField
        name="imageUrl"
        label="Kart Görseli"
        control={control}
        mediaBaseUrl={mediaBaseUrl}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          name="icon"
          label="İkon (isteğe bağlı)"
          placeholder="ör. truck, shield-check"
          description="Tasarımdaki ikon setinden bir isim."
          register={register}
          error={errors.icon}
        />
        <ColorField
          name="backgroundColor"
          label="Kart Rengi"
          description="Boş bırakılırsa bölüm/tema rengi."
          control={control}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          name="buttonText"
          label="Buton Metni"
          placeholder="ör. Detaylı Bilgi"
          register={register}
          error={errors.buttonText}
        />
        <FormField
          name="buttonHref"
          label="Buton Bağlantısı"
          placeholder="/hizmetler/nakliye"
          description="Site içi adres, / ile başlamalı."
          register={register}
          error={errors.buttonHref}
        />
      </div>

      <FormSwitch
        name="active"
        label="Yayında"
        description="Kapalıysa kart sitede görünmez."
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
