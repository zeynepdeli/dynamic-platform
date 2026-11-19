import "./zod-locale";
import { z } from "zod";

import {
  hexColorSchema,
  imageUrlSchema,
  INTERNAL_PATH_REGEX,
  optionalHexColorSchema,
} from "./common";
import { footerSchema } from "./footer.schema";
import { tLine, tPath, translationsSchema, tText } from "../i18n";

const optionalPath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || INTERNAL_PATH_REGEX.test(v), "/ ile başlayan site içi bir adres girin (ör. /iletisim).");

/**
 * Ortak alan ekranlarının şemaları. Her ekran yalnızca kendi alanlarını
 * gönderir; böylece bir ekrandan kayıt diğerinin alanlarını ezmez.
 */
export const settingsSchemas = {
  header: z
    .object({
      siteName: z.string().trim().min(1, "Site adı boş olamaz.").max(150),
      logoUrl: imageUrlSchema,
      headerBackgroundColor: optionalHexColorSchema,
      headerBackgroundImage: imageUrlSchema,
      headerButtonText: z.string().trim().max(40),
      headerButtonHref: optionalPath,
      translations: translationsSchema({ siteName: tLine(150), headerButtonText: tLine(40), headerButtonHref: tPath() }),
    })
    .refine((v) => !!v.headerButtonText === !!v.headerButtonHref, {
      path: ["headerButtonHref"],
      message: "Buton için metin ve bağlantı birlikte girilmeli.",
    }),
  background: z.object({
    backgroundColor: hexColorSchema,
    backgroundImage: imageUrlSchema,
  }),
  theme: z.object({
    primaryColor: hexColorSchema,
    secondaryColor: hexColorSchema,
  }),
  seo: z.object({
    metaTitle: z.string().trim().max(150),
    metaDescription: z.string().trim().max(300),
    metaKeywords: z.string().trim().max(300),
    description: z.string().trim().max(500),
    faviconUrl: imageUrlSchema,
    ogImageUrl: imageUrlSchema,
    allowIndexing: z.boolean(),
    gaMeasurementId: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => v === "" || /^G-[A-Z0-9]{4,15}$/.test(v), "Ölçüm kimliği G-XXXXXXX biçiminde olmalı."),
    translations: translationsSchema({
      metaTitle: tLine(150),
      metaDescription: tText(300),
      metaKeywords: tLine(300),
      description: tText(500),
    }),
  }),
  footer: footerSchema,
  notify: z.object({
    notifyEmail: z.union([z.literal(""), z.email("Geçerli bir e-posta girin.").max(254)]),
  }),
} as const;

export type SettingsGroup = keyof typeof settingsSchemas;
export type SettingsValues<G extends SettingsGroup> = z.infer<(typeof settingsSchemas)[G]>;
/** Form tarafında ortak kayıt tipi (çeviriler iç içe nesne) */
export type AnySettingsValues = Record<string, unknown>;
