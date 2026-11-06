import "server-only";

import { cookies } from "next/headers";

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export function isAdmin(user: AdminUser): boolean {
  return user.role === "ADMIN";
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    return null;
  }

  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as AdminUser;

    return isAdmin(user) ? user : null;
  } catch {
    return null;
  }
}
