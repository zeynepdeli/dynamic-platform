import { z } from "zod";

import {
  imageUrlSchema,
  internalPathSchema,
  optionalHexColorSchema,
} from "./common";

export const SECTION_TYPES = [
  "CARDS",
  "TEXT",
  "IMAGE_TEXT",
  "CTA",
  "FAQ",
  "GALLERY",
  "VIDEO",
  "MAP",
  "STATS",
  "CONTACT_FORM",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  CARDS: "Kart Izgarası",
  TEXT: "Metin",
  IMAGE_TEXT: "Görsel + Metin",
  CTA: "Çağrı Alanı",
  FAQ: "Sıkça Sorulanlar",
  GALLERY: "Galeri",
  VIDEO: "Video",
  MAP: "Harita",
  STATS: "Sayılar",
  CONTACT_FORM: "İletişim Formu",
};

/** Tip seçicide kısa açıklama */
export const SECTION_TYPE_HINTS: Record<SectionType, string> = {
  CARDS: "Hizmetler, ürünler, referanslar",
  TEXT: "Başlık ve paragraf",
  IMAGE_TEXT: "Yanda görsel, yanda metin",
  CTA: "Öne çıkan buton alanı",
  FAQ: "Açılır soru–cevap listesi",
  GALLERY: "Fotoğraf ızgarası",
  VIDEO: "YouTube veya Vimeo",
  MAP: "Adres ve Google Harita",
  STATS: "\u201C500+ müşteri\u201D gibi sayılar",
  CONTACT_FORM: "Ziyaretçi mesaj bırakır",
};

/** Yalnızca YouTube / Vimeo (API ile aynı kural) */
export const VIDEO_URL_REGEX =
  /^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|shorts\/|embed\/)[A-Za-z0-9_-]{11}(?:[&?][A-Za-z0-9_=&%.-]*)?|youtu\.be\/[A-Za-z0-9_-]{11}(?:\?[A-Za-z0-9_=&%.-]*)?|(?:www\.|player\.)?vimeo\.com\/(?:video\/)?\d{6,12})$/;

// Buton metni ile bağlantısı birlikte dolu ya da birlikte boş olmalı
function buttonPairIsValid(data: { buttonText: string; buttonHref: string }) {
  return (data.buttonText === "") === (data.buttonHref === "");
}

const buttonPairError = {
  path: ["buttonHref"],
  message: "Buton metni ve bağlantısı birlikte doldurulmalıdır.",
};

// Bölüm anahtarı (geliştirici için): "vizyon", "hizmetler"
export const SECTION_KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const sectionSchema = z
  .object({
    key: z
      .string()
      .trim()
      .max(50)
      .refine(
        (value) => value === "" || SECTION_KEY_REGEX.test(value),
        "Anahtar yalnızca küçük harf, rakam ve tire içerebilir (ör. vizyon).",
      ),
    type: z.enum(SECTION_TYPES),
    title: z.string().trim().max(200),
    subtitle: z.string().trim().max(300),
    body: z.string().trim().max(5000),
    backgroundColor: optionalHexColorSchema,
    backgroundImage: imageUrlSchema,
    textColor: optionalHexColorSchema,
    buttonText: z.string().trim().max(60),
    buttonHref: internalPathSchema,
    columns: z.number().int().min(1).max(4),
    videoUrl: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v === "" || VIDEO_URL_REGEX.test(v), "YouTube veya Vimeo video adresi girin."),
    mapAddress: z
      .string()
      .trim()
      .max(300)
      .refine((v) => !/[\u0000-\u001f]/.test(v), "Adres tek satır olmalı."),
    active: z.boolean(),
  })
  .refine(buttonPairIsValid, buttonPairError)
  .refine((v) => v.type !== "VIDEO" || v.videoUrl !== "", { path: ["videoUrl"], message: "Video adresi girin." })
  .refine((v) => v.type !== "MAP" || v.mapAddress !== "", { path: ["mapAddress"], message: "Adres girin." });

export type SectionFormValues = z.infer<typeof sectionSchema>;

export const sectionDefaultValues: SectionFormValues = {
  key: "",
  type: "CARDS",
  title: "",
  subtitle: "",
  body: "",
  backgroundColor: "",
  backgroundImage: "",
  textColor: "",
  buttonText: "",
  buttonHref: "",
  columns: 3,
  videoUrl: "",
  mapAddress: "",
  active: true,
};

// İkon adı: "truck", "shield-check" (SVG/HTML değil)
export const ICON_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const sectionItemSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Kart başlığı boş olamaz.")
      .max(200, "Kart başlığı en fazla 200 karakter olabilir."),
    description: z.string().trim().max(1000),
    imageUrl: imageUrlSchema,
    icon: z
      .string()
      .trim()
      .max(50)
      .refine(
        (value) => value === "" || ICON_NAME_REGEX.test(value),
        "İkon adı yalnızca küçük harf, rakam ve tire içerebilir.",
      ),
    buttonText: z.string().trim().max(60),
    buttonHref: internalPathSchema,
    backgroundColor: optionalHexColorSchema,
    backgroundImage: imageUrlSchema,
    active: z.boolean(),
  })
  .refine(buttonPairIsValid, buttonPairError);

export type SectionItemFormValues = z.infer<typeof sectionItemSchema>;

export const sectionItemDefaultValues: SectionItemFormValues = {
  title: "",
  description: "",
  imageUrl: "",
  icon: "",
  buttonText: "",
  buttonHref: "",
  backgroundColor: "",
  backgroundImage: "",
  active: true,
};
