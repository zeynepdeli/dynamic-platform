import "./validations/zod-locale";
import { z } from "zod";

import { INTERNAL_PATH_REGEX } from "./validations/common";

/** API'deki src/i18n/locales.ts ile aynı liste. Yeni dil: ikisine birden ekleyin. */
export const SUPPORTED_LOCALES = ["tr", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};

export const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(v);

export type LocaleConfig = { defaultLocale: Locale; locales: Locale[] };

/** API ile aynı kural: ana dil her zaman açık ve ilk sırada */
export function normalizeLocaleConfig(
  defaultLocale: unknown,
  locales: unknown,
): LocaleConfig {
  const def: Locale = isLocale(defaultLocale) ? defaultLocale : "tr";
  const list = Array.isArray(locales) ? locales.filter(isLocale) : [];
  return {
    defaultLocale: def,
    locales: [
      def,
      ...SUPPORTED_LOCALES.filter((l) => l !== def && list.includes(l)),
    ],
  };
}

// ───── Çeviri alanlarının doğrulaması (API'deki çeviri DTO'larıyla aynı sınırlar) ─────

const NO_CONTROL = /^[^\u0000-\u001f\u007f]*$/;
export const tLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `En fazla ${max} karakter.`)
    .regex(NO_CONTROL, "Bu alan tek satır olmalı.");
export const tText = (max: number) =>
  z.string().trim().max(max, `En fazla ${max} karakter.`);
export const tPath = () =>
  z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => v === "" || INTERNAL_PATH_REGEX.test(v),
      "Bağlantı / ile başlayan site içi bir adres olmalıdır.",
    );
export const tSlug = () =>
  z
    .string()
    .trim()
    .max(150)
    .regex(
      /^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Adres yalnızca küçük harf, rakam ve tire içerebilir (ör. about-us).",
    );

/**
 * Bir formun çeviri alanı: { en: { title: "", … } }. Boş metin = çeviri yok
 * (sitede ana dildeki değer görünür). Ana dil dahil her dil isteğe bağlı; formun varsayılanı {}.
 */
export function translationsSchema<S extends z.ZodRawShape>(shape: S) {
  const one = z.object(shape).partial();
  return z.object(
    Object.fromEntries(
      SUPPORTED_LOCALES.map((l) => [l, one.optional()]),
    ) as Record<Locale, z.ZodOptional<typeof one>>,
  );
}

export type TranslationsForm = Partial<Record<Locale, Record<string, string>>>;

/** API'den gelen translations JSON'u → form değeri (yalnızca bilinen dil ve alanlar, hepsi metin) */
export function toTranslationsForm(
  raw: unknown,
  fields: readonly string[],
): TranslationsForm {
  const out: TranslationsForm = {};
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  for (const locale of SUPPORTED_LOCALES) {
    const t = source[locale];
    const obj =
      t && typeof t === "object" && !Array.isArray(t)
        ? (t as Record<string, unknown>)
        : {};
    out[locale] = Object.fromEntries(
      fields.map((f) => [
        f,
        typeof obj[f] === "string" ? (obj[f] as string) : "",
      ]),
    );
  }
  return out;
}
