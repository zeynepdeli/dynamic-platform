"use server";

import { cookies } from "next/headers";
import type { LoginResponse, AdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: "E-posta veya şifre hatalı.",
      };
    }

    const data = (await response.json()) as LoginResponse;

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

    cookieStore.set("admin_session", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresIn,
    });

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

  cookieStore.delete("admin_session");

  redirect("/login");
}
