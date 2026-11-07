"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSwitch } from "@/components/forms/FormSwitch";

import { updateFooterAction } from "@/app/actions/footer";
import {
  footerSchema,
  type FooterFormValues,
} from "@/lib/validations/footer.schema";

const SOCIAL_FIELDS = [
  { name: "instagramUrl", label: "Instagram" },
  { name: "facebookUrl", label: "Facebook" },
  { name: "linkedinUrl", label: "LinkedIn" },
  { name: "youtubeUrl", label: "YouTube" },
  { name: "githubUrl", label: "GitHub" },
] as const;

export function FooterForm({ initialValues }: { initialValues: FooterFormValues }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FooterFormValues>({
    resolver: zodResolver(footerSchema),
    defaultValues: initialValues,
  });

  async function submit(values: FooterFormValues) {
    setSubmitError(null);
    setSaved(false);

    const result = await updateFooterAction(values);
    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    reset(values);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-7">
      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Footer</h2>

        <FormSwitch
          name="enabled"
          label="Footer gösterilsin"
          description="Kapalıysa sitenin alt kısmı gösterilmez."
          control={control}
        />

        <FormTextarea
          name="description"
          label="Kısa Açıklama"
          rows={3}
          register={register}
          error={errors.description}
        />

        <FormField
          name="copyright"
          label="Telif Metni"
          placeholder="© 2026 Firma Adı. Tüm hakları saklıdır."
          register={register}
          error={errors.copyright}
        />
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">İletişim Bilgileri</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            name="email"
            label="E-posta"
            type="email"
            register={register}
            error={errors.email}
          />
          <FormField
            name="phone"
            label="Telefon"
            type="tel"
            placeholder="+90 555 000 00 00"
            register={register}
            error={errors.phone}
          />
        </div>

        <FormTextarea
          name="address"
          label="Adres"
          rows={2}
          register={register}
          error={errors.address}
        />
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Sosyal Medya</h2>

        <div className="grid gap-5 md:grid-cols-2">
          {SOCIAL_FIELDS.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              label={field.label}
              placeholder="https://..."
              register={register}
              error={errors[field.name]}
            />
          ))}
        </div>
      </section>

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

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-h-11 gap-2 px-6"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>
    </form>
  );
}
