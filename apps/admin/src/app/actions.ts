"use server";

import { cookies } from "next/headers";
import { clientIpHeaders } from "@/lib/client-ip-headers";
import type { AdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  accessMaxAge,
  cookieOptions,
  isTokenPair,
} from "@/lib/session-cookies";

export type LoginResult = {
  success: boolean;
  error?: string;
};

export async function loginAdmin(
  email: string,
  password: string,
): Promise<LoginResult> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return {
      success: false,
      error: "API bağlantısı yapılandırılmamış.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await clientIpHeaders()),
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (response.status === 429) {
      return {
        success: false,
        error: "Çok fazla deneme yapıldı. Lütfen bir dakika sonra tekrar deneyin.",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: "E-posta veya şifre hatalı.",
      };
    }

    const data: unknown = await response.json();
    if (!isTokenPair(data)) {
      return { success: false, error: "Sunucu beklenmeyen bir yanıt verdi." };
    }

    // Kullanıcının ADMIN yetkisini backend üzerinden doğrula.
    const profileResponse = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
      cache: "no-store",
    });

    if (!profileResponse.ok) {
      return {
        success: false,
        error: "Kullanıcı doğrulanamadı.",
      };
    }

    const user = (await profileResponse.json()) as AdminUser;

    if (user.role !== "ADMIN") {
      return {
        success: false,
        error: "Bu alana erişim yetkiniz bulunmuyor.",
      };
    }

    const cookieStore = await cookies();

    cookieStore.set(
      ACCESS_COOKIE,
      data.accessToken,
      cookieOptions(accessMaxAge(data.expiresIn)),
    );
    cookieStore.set(
      REFRESH_COOKIE,
      data.refreshToken,
      cookieOptions(REFRESH_MAX_AGE),
    );

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Sunucu bağlantısında bir sorun oluştu.",
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  // Sunucudaki oturumu da kapat (çerez çalınmış olsa bile işe yaramaz)
  if (refreshToken && process.env.API_URL) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);

  redirect("/login");
}
