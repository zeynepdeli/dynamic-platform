import "./zod-locale";
import { z } from "zod";

import { LOCAL_DATETIME_REGEX } from "../datetime";
import { tLine, translationsSchema, tSlug, tText } from "../i18n";
import { imageUrlSchema } from "./common";

/** Blog yazısının çevrilebilen alanları (slug: o dildeki adres) */
export const POST_TRANSLATABLE = ["title", "slug", "excerpt", "content", "category", "seoTitle", "seoDescription"] as const;

const singleLine = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} en fazla ${max} karakter olabilir.`)
    .refine((v) => !/[\u0000-\u001f\u007f]/.test(v), `${label} tek satır olmalı.`);

export const postSchema = z.object({
  title: singleLine(200, "Başlık").pipe(z.string().min(2, "Başlık en az 2 karakter olmalıdır.")),
  slug: z
    .string()
    .trim()
    .min(2, "Adres en az 2 karakter olmalıdır.")
    .max(150, "Adres en fazla 150 karakter olabilir.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Yalnızca küçük harf, rakam ve tire kullanabilirsiniz."),
  excerpt: z.string().trim().max(500, "Özet en fazla 500 karakter olabilir."),
  content: z.string().max(50000, "İçerik en fazla 50.000 karakter olabilir."),
  coverImageUrl: imageUrlSchema,
  category: singleLine(60, "Kategori"),
  published: z.boolean(),
  /** Türkiye saatiyle "YYYY-MM-DDTHH:mm"; boş = yayınlandığı an */
  publishedAt: z.string().refine((v) => v === "" || LOCAL_DATETIME_REGEX.test(v), "Geçerli bir tarih seçin."),
  seoTitle: singleLine(150, "SEO başlığı"),
  seoDescription: z.string().trim().max(300, "SEO açıklaması en fazla 300 karakter olabilir."),
  translations: translationsSchema({
    title: tLine(200),
    slug: tSlug(),
    excerpt: tText(500),
    content: tText(50000),
    category: tLine(60),
    seoTitle: tLine(150),
    seoDescription: tText(300),
  }),
});

export type PostFormValues = z.infer<typeof postSchema>;

export const postDefaultValues: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "",
  published: false,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  translations: {},
};
