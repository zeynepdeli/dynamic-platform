import { z } from "zod";

import { hexColorSchema, imageUrlSchema } from "./common";

export const appearanceSchema = z
  .object({
    siteName: z
      .string()
      .trim()
      .min(1, "Site adı boş olamaz.")
      .max(150, "Site adı en fazla 150 karakter olabilir."),
    description: z.string().trim().max(500),

    logoUrl: imageUrlSchema,
    faviconUrl: imageUrlSchema,

    primaryColor: hexColorSchema,
    secondaryColor: hexColorSchema,

    backgroundType: z.enum(["COLOR", "IMAGE"]),
    backgroundColor: hexColorSchema,
    backgroundImage: imageUrlSchema,

    metaTitle: z.string().trim().max(150),
    metaDescription: z.string().trim().max(300),
  })
  .refine(
    (data) => data.backgroundType !== "IMAGE" || data.backgroundImage !== "",
    {
      path: ["backgroundImage"],
      message: "Görsel arka plan için bir görsel adresi girin.",
    },
  );

export type AppearanceFormValues = z.infer<typeof appearanceSchema>;
