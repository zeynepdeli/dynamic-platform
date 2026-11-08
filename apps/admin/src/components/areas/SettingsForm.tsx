"use client";

import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ColorField } from "@/components/forms/ColorField";
import { FormField } from "@/components/forms/FormField";
import { FormSwitch } from "@/components/forms/FormSwitch";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { ImageUploadField } from "@/components/forms/ImageUploadField";

import { updateSettingsAction } from "@/app/actions/settings";
import {
  settingsSchemas,
  type AnySettingsValues,
  type SettingsGroup,
} from "@/lib/validations/settings.schema";

import { AreaCard } from "./AreaShell";

export type SettingsField = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "color" | "color-optional" | "image" | "switch";
  description?: string;
  placeholder?: string;
  required?: boolean;
  /** İki sütunun ikisini birden kaplasın */
  wide?: boolean;
};

export type SettingsPanel = { title: string; hint?: string; fields: SettingsField[] };

/**
 * Başlıklı paneller + en altta tek kaydet butonu (enfesGurme düzeni).
 * Alan tanımları ekran dosyasında durur; doğrulama grup şemasıyla yapılır.
 */
export function SettingsForm({
  group,
  panels,
  initialValues,
  mediaBaseUrl,
  submitLabel,
}: {
  group: SettingsGroup;
  panels: SettingsPanel[];
  initialValues: AnySettingsValues;
  mediaBaseUrl: string;
  submitLabel: string;
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
  } = useForm<AnySettingsValues>({
    // Grup şemaları farklı tipte; form tarafında ortak kayıt tipiyle çalışılır
    resolver: zodResolver(settingsSchemas[group] as never),
    defaultValues: initialValues,
  });

  // Kaydetmeden çıkılırsa uyar
  useUnsavedChanges(isDirty && !isSubmitting);

  async function submit(values: AnySettingsValues) {
    setError(null);
    setSaved(false);
    const result = await updateSettingsAction(group, values);
    if (!result.success) {
      setError(result.error);
      return;
    }
    reset(values);
    setSaved(true);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-6">
      {panels.map((panel) => (
        <AreaCard key={panel.title} title={panel.title} hint={panel.hint}>
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            {panel.fields.map((field) => (
              <div key={field.name} className={field.wide ? "@xl:col-span-2" : undefined}>
                <Field field={field} register={register} control={control} errors={errors} mediaBaseUrl={mediaBaseUrl} />
              </div>
            ))}
          </div>
        </AreaCard>
      ))}

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {saved && !isDirty && (
          <span role="status" className="mr-auto flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            Kaydedildi
          </span>
        )}
        <Button type="submit" disabled={isSubmitting || !isDirty} className="min-h-11 gap-2 rounded-full px-7">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  field,
  register,
  control,
  errors,
  mediaBaseUrl,
}: {
  field: SettingsField;
  register: UseFormRegister<AnySettingsValues>;
  control: Control<AnySettingsValues>;
  errors: FieldErrors<AnySettingsValues>;
  mediaBaseUrl: string;
}) {
  const common = { label: field.label, description: field.description };
  switch (field.kind) {
    case "textarea":
      return <FormTextarea name={field.name} rows={3} register={register} error={errors[field.name]} {...common} />;
    case "color":
      return <ColorField name={field.name} control={control} {...common} />;
    case "color-optional":
      return <ColorField name={field.name} control={control} allowEmpty {...common} />;
    case "image":
      return <ImageUploadField name={field.name} control={control} mediaBaseUrl={mediaBaseUrl} {...common} />;
    case "switch":
      return <FormSwitch name={field.name as never} control={control} {...common} />;
    default:
      return (
        <FormField
          name={field.name}
          register={register}
          error={errors[field.name]}
          placeholder={field.placeholder}
          required={field.required}
          {...common}
        />
      );
  }
}
