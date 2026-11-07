import { z } from "zod";

import { SOCIAL_ICON_KEYS } from "@/components/icons/registry";

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export const socialLinkSchema = z.object({
  icon: z.enum(SOCIAL_ICON_KEYS, "Bir ikon seçin."),
  url: z
    .string()
    .trim()
    .min(1, "Adres zorunludur.")
    .max(500)
    .refine(isHttpsUrl, "https:// ile başlayan bir adres girin."),
  label: z.string().trim().max(60),
  visible: z.boolean(),
});

export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>;

export type SocialLink = SocialLinkFormValues & { id: string; order: number };

export const MAX_SOCIAL_LINKS = 20;
