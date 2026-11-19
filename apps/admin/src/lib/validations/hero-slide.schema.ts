import "./zod-locale";
import { z } from "zod";

import { imageUrlSchema, internalPathSchema } from "./common";
import { tLine, tPath, translationsSchema, tText } from "../i18n";

/** Slider'ın çevrilebilen alanları */
export const HERO_TRANSLATABLE = ["title", "subtitle", "description", "buttonText", "buttonHref"] as const;

/** API ile aynı sınır */
export const MAX_HERO_SLIDES = 5;

export const heroSlideSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Slider başlığı boş olamaz.")
      .max(200, "Başlık en fazla 200 karakter olabilir."),
    subtitle: z.string().trim().max(200),
    description: z.string().trim().max(2000),
    imageUrl: imageUrlSchema,
    mobileImageUrl: imageUrlSchema,
    /** Arka planın önünde duran görsel (ör. dekupe kişi/ürün fotoğrafı) */
    foregroundImageUrl: imageUrlSchema,
    buttonText: z.string().trim().max(100),
    buttonHref: internalPathSchema,
    active: z.boolean(),
    translations: translationsSchema({
      title: tLine(200),
      subtitle: tLine(200),
      description: tText(2000),
      buttonText: tLine(100),
      buttonHref: tPath(),
    }),
  })
  .refine((d) => (d.buttonText === "") === (d.buttonHref === ""), {
    path: ["buttonHref"],
    message: "Buton metni ve bağlantısı birlikte doldurulmalıdır.",
  });

export type HeroSlideFormValues = z.infer<typeof heroSlideSchema>;

export const heroSlideDefaultValues: HeroSlideFormValues = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  mobileImageUrl: "",
  foregroundImageUrl: "",
  buttonText: "",
  buttonHref: "",
  active: true,
  translations: {},
};
