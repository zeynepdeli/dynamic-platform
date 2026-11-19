"use client";

import { Globe } from "lucide-react";
import {
  get,
  useFormState,
  useWatch,
  type Control,
  type FieldError,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { LOCALE_NAMES, type Locale } from "@/lib/i18n";

import { useExtraLocales, useLocaleConfig } from "./LocaleProvider";

export type TranslatableField = {
  /** Formdaki asıl alanın adı (ör. "title"); çevirisi translations.<dil>.<ad> */
  name: string;
  label: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
};

/**
 * Formun altında, açık olan her ek dil için çeviri kutusu. Sitede yalnızca ana dil açıksa hiç görünmez.
 * Her alanın altında ana dildeki değer gösterilir; boş bırakılan alan sitede ana dildeki değerle çıkar.
 */
export function TranslationPanel<T extends FieldValues>({
  fields,
  control,
  register,
}: {
  fields: TranslatableField[];
  control: Control<T>;
  register: UseFormRegister<T>;
}) {
  const extra = useExtraLocales();
  if (extra.length === 0) return null;
  return (
    <div className="space-y-4">
      {extra.map((locale) => (
        <LocaleBox
          key={locale}
          locale={locale}
          fields={fields}
          control={control}
          register={register}
        />
      ))}
    </div>
  );
}

function LocaleBox<T extends FieldValues>({
  locale,
  fields,
  control,
  register,
}: {
  locale: Locale;
  fields: TranslatableField[];
  control: Control<T>;
  register: UseFormRegister<T>;
}) {
  const { defaultLocale } = useLocaleConfig();
  const { errors } = useFormState({ control });
  const base = useWatch({
    control,
    name: fields.map((f) => f.name) as never,
  }) as unknown as string[];
  const translated = useWatch({
    control,
    name: fields.map((f) => `translations.${locale}.${f.name}`) as never,
  }) as unknown as (string | undefined)[];
  // Ana dilde dolu olup bu dilde boş kalan alanlar
  const missing = fields.filter(
    (_, i) => base[i]?.trim() && !translated[i]?.trim(),
  ).length;

  return (
    <section
      aria-label={`${LOCALE_NAMES[locale]} çevirisi`}
      className="rounded-2xl border border-dashed border-(--brand-accent)/40 bg-(--brand-accent)/4 p-4 sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-(--brand-primary)">
          <Globe className="size-4 text-(--brand-accent)" aria-hidden />
          {LOCALE_NAMES[locale]} ({locale.toUpperCase()})
        </h3>
        <span
          className={
            missing
              ? "rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
              : "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
          }
        >
          {missing ? `${missing} alan çevrilmedi` : "Çeviriler tamam"}
        </span>
      </header>
      <div className="grid items-start gap-4 @xl:grid-cols-2">
        {fields.map((f, i) => {
          const name = `translations.${locale}.${f.name}`;
          const hint = base[i]?.trim()
            ? `${defaultLocale.toUpperCase()}: ${base[i].length > 120 ? `${base[i].slice(0, 120)}…` : base[i]}`
            : `${defaultLocale.toUpperCase()} alanı boş`;
          const error = get(errors, name) as FieldError | undefined;
          return f.multiline ? (
            <div key={f.name} className="@xl:col-span-2">
              <FormTextarea
                name={name as never}
                label={f.label}
                rows={f.rows ?? 3}
                register={register}
                error={error}
                description={hint}
                placeholder={f.placeholder}
              />
            </div>
          ) : (
            <FormField
              key={f.name}
              name={name as never}
              label={f.label}
              register={register}
              error={error}
              description={hint}
              placeholder={f.placeholder}
            />
          );
        })}
      </div>
    </section>
  );
}
