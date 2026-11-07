import { z } from "zod";

import { INTERNAL_PATH_REGEX } from "./common";

export const menuItemSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Menü başlığı boş olamaz.")
    .max(100, "Menü başlığı en fazla 100 karakter olabilir."),
  href: z
    .string()
    .trim()
    .min(1, "Bağlantı zorunludur.")
    .max(500)
    .regex(
      INTERNAL_PATH_REGEX,
      "Bağlantı / ile başlayan site içi bir adres olmalıdır (ör. /hakkimizda).",
    ),
  // "" = üst seviye
  parentId: z.union([z.uuid(), z.literal("")]),
  visible: z.boolean(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export const menuItemDefaultValues: MenuItemFormValues = {
  label: "",
  href: "",
  parentId: "",
  visible: true,
};
