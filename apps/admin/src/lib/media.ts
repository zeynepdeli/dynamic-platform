import "server-only";

import { adminFetch } from "@/lib/api";

export type MediaFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  /** Sitede herhangi bir yerde kullanılıyor mu? (API hesaplar) */
  inUse: boolean;
};

export async function getAdminMedia(): Promise<MediaFile[]> {
  const response = await adminFetch("/admin/media");

  if (!response.ok) {
    throw new Error(`Medya yüklenemedi (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as MediaFile[]) : [];
}
