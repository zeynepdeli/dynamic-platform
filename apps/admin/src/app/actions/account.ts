"use server";

import { cookies } from "next/headers";
import { ApiError, adminFetch, readApiError } from "@/lib/api";
import { passwordSchema } from "@/lib/validations/account.schema";


/**
 * Şifre değiştirme. Başarılı olunca API eski oturumları geçersiz kılar
 * ve yeni bir oturum anahtarı döner; çerez onunla yenilenir.
 */
export async function changePasswordAction(values: unknown): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = passwordSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };

  try {
    const response = await adminFetch("/auth/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    });
    if (response.status === 429) {
      return { success: false, error: "Çok fazla deneme yapıldı. Bir dakika sonra tekrar deneyin." };
    }
    if (!response.ok) {
      return { success: false, error: await readApiError(response, "Şifre değiştirilemedi.") };
    }

    const data = (await response.json()) as { accessToken?: unknown; expiresIn?: unknown };
    if (typeof data.accessToken !== "string") return { success: false, error: "Şifre değiştirilemedi." };

    (await cookies()).set("admin_session", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: typeof data.expiresIn === "number" ? data.expiresIn : 900,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "Beklenmeyen bir hata oluştu." };
  }
}
