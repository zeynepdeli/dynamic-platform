"use server";

import { z } from "zod";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { emptyToNull, imageUrlSchema, optionalHexColorSchema } from "@/lib/validations/common";

const backgroundSchema = z.object({
  backgroundColor: optionalHexColorSchema,
  backgroundImage: imageUrlSchema,
});

export type BackgroundValues = z.infer<typeof backgroundSchema>;

/**
 * Sayfaya özel arka plan.
 * pageId = null → Ana Sayfa (site ayarlarındaki home alanları)
 */
export async function updatePageBackgroundAction(
  pageId: string | null,
  values: BackgroundValues,
): Promise<ActionResult> {
  if (pageId !== null && !z.uuid().safeParse(pageId).success) {
    return invalid("Geçersiz sayfa.");
  }

  const parsed = backgroundSchema.safeParse(values);
  if (!parsed.success) return invalid();

  const color = emptyToNull(parsed.data.backgroundColor);
  const image = emptyToNull(parsed.data.backgroundImage);

  return pageId
    ? sendToApi(
        `/admin/pages/${pageId}`,
        "PATCH",
        { backgroundColor: color, backgroundImage: image },
        "Arka plan kaydedilemedi.",
        "/pages",
      )
    : sendToApi(
        "/admin/site-settings",
        "PATCH",
        { homeBackgroundColor: color, homeBackgroundImage: image },
        "Arka plan kaydedilemedi.",
        "/pages",
      );
}
