"use server";

import { z } from "zod";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { SUPPORTED_LOCALES } from "@/lib/i18n";

const schema = z.object({
  defaultLocale: z.enum(SUPPORTED_LOCALES),
  locales: z.array(z.enum(SUPPORTED_LOCALES)).max(SUPPORTED_LOCALES.length),
});

/** Sitenin dilleri. Sunucuda yeniden doğrulanır; API ana dili her zaman açık tutar. */
export async function updateLanguagesAction(
  values: unknown,
): Promise<ActionResult> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) return invalid();
  const { defaultLocale, locales } = parsed.data;
  return sendToApi(
    "/admin/site-settings",
    "PATCH",
    { defaultLocale, locales: [...new Set([defaultLocale, ...locales])] },
    "Dil ayarları kaydedilemedi.",
    "/areas/languages",
  );
}
