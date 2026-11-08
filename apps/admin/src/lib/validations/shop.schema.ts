import "./zod-locale";
import { z } from "zod";

import { imageUrlSchema } from "./common";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ONE_LINE = /^[^\u0000-\u001f\u007f]*$/;
const PRICE = /^\d{1,8}(?:[.,]\d{1,2})?$/;

const oneLine = (max: number) => z.string().trim().max(max).regex(ONE_LINE, "Bu alan tek satır olmalıdır.");
const slug = z
  .string()
  .trim()
  .min(1, "Adres zorunludur.")
  .max(150)
  .regex(SLUG, "Yalnızca küçük harf, rakam ve tire kullanın (ör. tulum-peyniri).");

/** "1.249,90" değil, "1249,90" veya "1249.90" biçimi */
export const priceText = z
  .string()
  .trim()
  .regex(PRICE, "Fiyatı 1249,90 biçiminde girin (en fazla 2 kuruş basamağı).");

export const toPrice = (value: string) => Number(value.trim().replace(",", "."));

export const categorySchema = z.object({
  name: oneLine(120).min(1, "Kategori adı zorunludur."),
  slug,
  description: z.string().trim().max(2000),
  imageUrl: imageUrlSchema,
  active: z.boolean(),
  metaTitle: oneLine(150),
  metaDescription: z.string().trim().max(300),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const categoryDefaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  active: true,
  metaTitle: "",
  metaDescription: "",
};

export const MAX_PRODUCT_IMAGES = 12;
export const MAX_PRODUCT_TABS = 10;

export const productSchema = z
  .object({
    name: oneLine(200).min(1, "Ürün adı zorunludur."),
    slug,
    sku: z
      .string()
      .trim()
      .max(64)
      .regex(/^[A-Za-z0-9._-]*$/, "Stok kodu yalnızca harf, rakam, nokta, tire ve alt çizgi içerebilir."),
    summary: z.string().trim().max(500),
    description: z.string().trim().max(20000),
    price: priceText,
    compareAtPrice: z.union([priceText, z.literal("")]),
    unit: oneLine(40),
    stock: z.string().trim().regex(/^\d{1,7}$/, "Stok 0 veya pozitif bir tam sayı olmalıdır."),
    trackStock: z.boolean(),
    active: z.boolean(),
    featured: z.boolean(),
    categoryId: z.union([z.uuid(), z.literal("")]),
    metaTitle: oneLine(150),
    metaDescription: z.string().trim().max(300),
    images: z
      .array(z.object({ url: imageUrlSchema.refine((v) => v !== "", "Görsel seçin."), alt: oneLine(200) }))
      .max(MAX_PRODUCT_IMAGES, `En fazla ${MAX_PRODUCT_IMAGES} görsel eklenebilir.`),
    tabs: z
      .array(
        z.object({
          title: oneLine(80).min(1, "Sekme başlığı zorunludur."),
          body: z.string().trim().min(1, "Sekme içeriği zorunludur.").max(10000),
        }),
      )
      .max(MAX_PRODUCT_TABS, `En fazla ${MAX_PRODUCT_TABS} sekme eklenebilir.`),
  })
  .refine((v) => v.compareAtPrice === "" || toPrice(v.compareAtPrice) > toPrice(v.price), {
    path: ["compareAtPrice"],
    message: "Eski fiyat, satış fiyatından yüksek olmalıdır.",
  });
export type ProductFormValues = z.infer<typeof productSchema>;

export const productDefaultValues: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  summary: "",
  description: "",
  price: "",
  compareAtPrice: "",
  unit: "",
  stock: "0",
  trackStock: true,
  active: true,
  featured: false,
  categoryId: "",
  metaTitle: "",
  metaDescription: "",
  images: [],
  tabs: [],
};
