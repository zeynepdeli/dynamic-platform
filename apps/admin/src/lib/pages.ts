import "server-only";

import { cookies } from "next/headers";

export type Page = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminPages(): Promise<Page[]> {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) {
    throw new Error("Yönetici oturumu bulunamadı. Lütfen yeniden giriş yapın.");
  }

  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL ortam değişkeni tanımlanmamış.");
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/admin/pages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Sayfa API bağlantı hatası:", error);

    throw new Error(
      "NestJS API sunucusuna bağlanılamadı. API'nin çalıştığını kontrol edin.",
    );
  }

  if (!response.ok) {
    console.error("Sayfa API hatası:", {
      status: response.status,
      statusText: response.statusText,
      endpoint: "/admin/pages",
    });

    throw new Error(
      `Sayfalar yüklenemedi. HTTP durum kodu: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    console.error("Beklenmeyen sayfa API yanıtı.");

    throw new Error("API beklenmeyen bir veri formatı döndürdü.");
  }

  return data as Page[];
}

export async function getAdminPageById(id: string) {
  const { cookies } = await import("next/headers");

  const token = (await cookies()).get("admin_session")?.value;

  if (!token) {
    throw new Error("Oturum bulunamadı.");
  }

  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API bağlantısı yapılandırılmamış.");
  }

  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/admin/pages/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Sayfa bilgileri alınamadı.");
  }

  return response.json();
}

export async function getDeletedPages(): Promise<Page[]> {
  const token = (await cookies()).get("admin_session")?.value;

  if (!token) {
    throw new Error("Yönetici oturumu bulunamadı. Lütfen yeniden giriş yapın.");
  }

  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error("API_URL ortam değişkeni tanımlanmamış.");
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/admin/pages/trash`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Çöp kutusu API bağlantı hatası:", error);

    throw new Error(
      "NestJS API sunucusuna bağlanılamadı. API'nin çalıştığını kontrol edin.",
    );
  }

  if (!response.ok) {
    console.error("Çöp kutusu API hatası:", {
      status: response.status,
      statusText: response.statusText,
      endpoint: "/admin/pages/trash",
    });

    throw new Error(
      `Silinen sayfalar yüklenemedi. HTTP durum kodu: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("API beklenmeyen bir veri formatı döndürdü.");
  }

  return data as Page[];
}
