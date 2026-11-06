"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { pageSchema, type PageFormValues } from "@/lib/validations/page.schema";

import { getAdminPageById } from "@/lib/pages";

type PageActionResult = { success: true } | { success: false; error: string };

type PageDetailsResult =
  | {
      success: true;
      data: PageFormValues;
    }
  | {
      success: false;
      error: string;
    };

function getApiUrl() {
  return process.env.API_URL?.replace(/\/$/, "");
}

async function getToken() {
  return (await cookies()).get("admin_session")?.value;
}

function preparePayload(values: PageFormValues) {
  return {
    title: values.title,
    slug: values.slug,
    content: values.content,
    published: values.published,
    seoTitle: values.seoTitle || null,
    seoDescription: values.seoDescription || null,
    seoKeywords: values.seoKeywords || null,
    ogImageUrl: values.ogImageUrl || null,
    noIndex: values.noIndex,
  };
}

function getApiError(status: number, operation: "create" | "update"): string {
  if (status === 401) {
    return "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.";
  }

  if (status === 403) {
    return "Bu işlem için yönetici yetkiniz bulunmuyor.";
  }

  if (status === 404) {
    return "İlgili sayfa bulunamadı.";
  }

  if (status === 409) {
    return "Bu URL adresi (slug) zaten kullanılıyor.";
  }

  return operation === "create"
    ? "Sayfa oluşturulamadı. Lütfen tekrar deneyin."
    : "Sayfa güncellenemedi. Lütfen tekrar deneyin.";
}

// Yeni sayfa oluşturma
export async function createPageAction(
  values: PageFormValues,
): Promise<PageActionResult> {
  const parsed = pageSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: "Form bilgilerini kontrol edin.",
    };
  }

  const token = await getToken();

  if (!token) {
    return {
      success: false,
      error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
    };
  }

  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return {
      success: false,
      error: "API bağlantısı yapılandırılmamış.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preparePayload(parsed.data)),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: getApiError(response.status, "create"),
      };
    }

    revalidatePath("/pages");

    return { success: true };
  } catch {
    return {
      success: false,
      error: "API sunucusuna bağlanılamadı.",
    };
  }
}

// Sayfa güncelleme
export async function updatePageAction(
  id: string,
  values: PageFormValues,
): Promise<PageActionResult> {
  if (!id) {
    return {
      success: false,
      error: "Sayfa kimliği bulunamadı.",
    };
  }

  const parsed = pageSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: "Form bilgilerini kontrol edin.",
    };
  }

  const token = await getToken();

  if (!token) {
    return {
      success: false,
      error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
    };
  }

  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return {
      success: false,
      error: "API bağlantısı yapılandırılmamış.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/pages/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preparePayload(parsed.data)),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: getApiError(response.status, "update"),
      };
    }

    revalidatePath("/pages");
    revalidatePath(`/pages/${id}`);

    return { success: true };
  } catch {
    return {
      success: false,
      error: "API sunucusuna bağlanılamadı.",
    };
  }
}

// Düzenleme modalı için kayıtlı sayfa bilgileri
export async function getPageForEditAction(
  id: string,
): Promise<PageDetailsResult> {
  if (!id) {
    return {
      success: false,
      error: "Sayfa kimliği bulunamadı.",
    };
  }

  try {
    const page = await getAdminPageById(id);

    if (!page) {
      return {
        success: false,
        error: "Sayfa bulunamadı.",
      };
    }

    const parsed = pageSchema.safeParse({
      title: page.title,
      slug: page.slug,
      content: page.content ?? "",
      published: page.published,
      seoTitle: page.seoTitle ?? "",
      seoDescription: page.seoDescription ?? "",
      seoKeywords: page.seoKeywords ?? "",
      ogImageUrl: page.ogImageUrl ?? "",
      noIndex: page.noIndex ?? false,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: "Kayıtlı sayfa bilgileri doğrulanamadı.",
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  } catch {
    return {
      success: false,
      error: "Sayfa bilgileri alınamadı.",
    };
  }
}

export async function deletePageAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!id) {
    return {
      success: false,
      error: "Sayfa kimliği bulunamadı.",
    };
  }

  const token = await getToken();

  if (!token) {
    return {
      success: false,
      error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
    };
  }

  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return {
      success: false,
      error: "API bağlantısı yapılandırılmamış.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/pages/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: "Sayfa bulunamadı veya daha önce silinmiş.",
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: "Bu işlem için geçerli yönetici yetkiniz bulunmuyor.",
        };
      }

      return {
        success: false,
        error: "Sayfa çöp kutusuna taşınamadı.",
      };
    }

    revalidatePath("/pages");

    return { success: true };
  } catch {
    return {
      success: false,
      error: "API sunucusuna bağlanılamadı.",
    };
  }
}

// Silinen sayfayı çöp kutusundan geri yükleme
export async function restorePageAction(id: string): Promise<PageActionResult> {
  if (!id) {
    return {
      success: false,
      error: "Sayfa kimliği bulunamadı.",
    };
  }

  const token = await getToken();

  if (!token) {
    return {
      success: false,
      error: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
    };
  }

  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return {
      success: false,
      error: "API bağlantısı yapılandırılmamış.",
    };
  }

  try {
    const response = await fetch(
      `${apiUrl}/pages/${encodeURIComponent(id)}/restore`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: "Silinen sayfa bulunamadı.",
        };
      }

      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: "Bu işlem için geçerli yönetici yetkiniz bulunmuyor.",
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          error: "Bu URL adresi başka bir sayfa tarafından kullanılıyor.",
        };
      }

      return {
        success: false,
        error: "Sayfa geri yüklenemedi. Lütfen tekrar deneyin.",
      };
    }

    revalidatePath("/pages");
    revalidatePath("/pages/trash");

    return { success: true };
  } catch {
    return {
      success: false,
      error: "API sunucusuna bağlanılamadı.",
    };
  }
}
