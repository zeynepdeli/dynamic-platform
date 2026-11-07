"use server";

import { revalidatePath } from "next/cache";

import { ApiError, adminFetch, apiErrorMessage } from "@/lib/api";
import { z } from "zod";

import { emptyToNull, imageUrlSchema } from "@/lib/validations/common";
import {
  appearanceSchema,
  type AppearanceFormValues,
} from "@/lib/validations/appearance.schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateAppearanceAction(
  values: AppearanceFormValues,
): Promise<ActionResult> {
  // Server action'lar dışarıdan doğrudan çağrılabilir:
  // istemci doğrulamasına güvenmeden burada TEKRAR doğrula.
  const parsed = appearanceSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Form bilgilerini kontrol edin." };
  }

  const v = parsed.data;

  // Yalnızca bilinen alanları gönder (fazladan alan sızmaz)
  const payload = {
    siteName: v.siteName,
    description: emptyToNull(v.description),
    logoUrl: emptyToNull(v.logoUrl),
    faviconUrl: emptyToNull(v.faviconUrl),
    primaryColor: v.primaryColor,
    secondaryColor: v.secondaryColor,
    backgroundType: v.backgroundType,
    backgroundColor: v.backgroundColor,
    backgroundImage: emptyToNull(v.backgroundImage),
    metaTitle: emptyToNull(v.metaTitle),
    metaDescription: emptyToNull(v.metaDescription),
  };

  try {
    const response = await adminFetch("/admin/site-settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: apiErrorMessage(response.status, "Ayarlar kaydedilemedi."),
      };
    }

    revalidatePath("/appearance");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof ApiError
          ? error.message
          : "Beklenmeyen bir hata oluştu.",
    };
  }
}

// Header bloğu için: yalnızca site adı ve logo (diğer ayarlara dokunmaz)
// (refine içeren şemada .pick() kullanılamaz; alanlar ayrıca tanımlanır)
const brandingSchema = z.object({
  siteName: z.string().trim().min(1, "Site adı boş olamaz.").max(150),
  logoUrl: imageUrlSchema,
});

export async function updateBrandingAction(values: {
  siteName: string;
  logoUrl: string;
}): Promise<ActionResult> {
  const parsed = brandingSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Form bilgilerini kontrol edin." };
  }

  try {
    const response = await adminFetch("/admin/site-settings", {
      method: "PATCH",
      body: JSON.stringify({
        siteName: parsed.data.siteName,
        logoUrl: emptyToNull(parsed.data.logoUrl),
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: apiErrorMessage(response.status, "Kaydedilemedi."),
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : "Beklenmeyen bir hata oluştu.",
    };
  }
}
