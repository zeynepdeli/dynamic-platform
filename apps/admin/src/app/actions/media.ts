"use server";

import { ApiError, adminFetch, apiErrorMessage } from "@/lib/api";
import { sendToApi } from "@/lib/admin/send";
import { validateImageFile } from "@/lib/validations/media";

type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

const MEDIA_URL_REGEX =
  /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export async function uploadImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");

  // Server action dışarıdan doğrudan çağrılabilir: tekrar kontrol et
  if (!(file instanceof File)) {
    return { success: false, error: "Yüklenecek görsel bulunamadı." };
  }

  const fileError = validateImageFile(file);
  if (fileError) {
    return { success: false, error: fileError };
  }

  // API tek parça bekliyor (fields: 0, parts: 1): yalnızca dosyayı gönder,
  // istemciden gelen başka alan varsa API'ye taşınmaz.
  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const response = await adminFetch("/admin/media/upload", {
      method: "POST",
      body,
    });

    if (response.status === 413) {
      return { success: false, error: "Görsel en fazla 5 MB olabilir." };
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          response.status === 400
            ? "Görsel işlenemedi. Dosya bozuk ya da desteklenmeyen formatta olabilir."
            : apiErrorMessage(response.status, "Görsel yüklenemedi."),
      };
    }

    const media = (await response.json()) as { url?: unknown };

    // API yanıtına da körü körüne güvenme
    if (typeof media.url !== "string" || !MEDIA_URL_REGEX.test(media.url)) {
      return { success: false, error: "Sunucudan beklenmeyen yanıt alındı." };
    }

    return { success: true, url: media.url };
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

const MEDIA_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteMediaAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (typeof id !== "string" || !MEDIA_ID.test(id)) {
    return { success: false, error: "Geçersiz medya." };
  }

  return sendToApi(
    `/admin/media/${id}`,
    "DELETE",
    undefined,
    "Görsel silinemedi.",
    "/media",
  );
}
