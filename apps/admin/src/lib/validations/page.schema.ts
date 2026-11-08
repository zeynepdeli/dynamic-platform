import "./zod-locale";
import { z } from "zod";

export const pageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Sayfa başlığı en az 2 karakter olmalıdır.")
    .max(150, "Sayfa başlığı en fazla 150 karakter olabilir."),

  slug: z
    .string()
    .trim()
    .min(2, "URL adresi en az 2 karakter olmalıdır.")
    .max(150, "URL adresi en fazla 150 karakter olabilir.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Yalnızca küçük harf, rakam ve tire kullanabilirsiniz.",
    ),

  content: z.string(),

  published: z.boolean(),

  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional(),
  seoKeywords: z.string().optional(),
  ogImageUrl: z
    .union([z.url("Geçerli bir görsel URL'si girin."), z.literal("")])
    .optional(),

  noIndex: z.boolean(),
});

export type PageFormValues = z.infer<typeof pageSchema>;

export const pageDefaultValues: PageFormValues = {
  title: "",
  slug: "",
  content: "",
  published: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  ogImageUrl: "",
  noIndex: false,
};
