"use server";

import { cookies } from "next/headers";
import { ApiError, adminFetch, readApiError } from "@/lib/api";
import { passwordSchema } from "@/lib/validations/account.schema";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  accessMaxAge,
  cookieOptions,
  isTokenPair,
} from "@/lib/session-cookies";

/**
 * Şifre değiştirme. Başarılı olunca API eski oturumları geçersiz kılar
 * ve yeni bir oturum anahtarı döner; çerez onunla yenilenir.
 */
export async function changePasswordAction(
  values: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = passwordSchema.safeParse(values);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin.",
    };

  try {
    const response = await adminFetch("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    });
    if (response.status === 429) {
      return {
        success: false,
        error: "Çok fazla deneme yapıldı. Bir dakika sonra tekrar deneyin.",
      };
    }
    if (!response.ok) {
      return {
        success: false,
        error: await readApiError(response, "Şifre değiştirilemedi."),
      };
    }

    const data: unknown = await response.json();
    if (!isTokenPair(data))
      return { success: false, error: "Şifre değiştirilemedi." };

    const store = await cookies();
    store.set(
      ACCESS_COOKIE,
      data.accessToken,
      cookieOptions(accessMaxAge(data.expiresIn)),
    );
    store.set(
      REFRESH_COOKIE,
      data.refreshToken,
      cookieOptions(REFRESH_MAX_AGE),
    );
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
