import "server-only";

import { REVALIDATE_SECONDS, getApiUrl } from "./config";

/**
 * API'ye GET isteği.
 * - Yalnızca "/" ile başlayan yollar (SSRF koruması)
 * - redirect: "error" — API başka adrese yönlendiremez
 * - 5 sn zaman aşımı — API yavaşsa site kilitlenmez
 * - Next önbelleği: REVALIDATE_SECONDS saniyede bir yenilenir
 * - 404 → null
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Geçersiz API yolu.");
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: { Accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(5000),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["site"] },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    // Ayrıntı log'a, ziyaretçiye değil
    throw new Error(`API isteği başarısız: ${path} (HTTP ${response.status})`);
  }

  return (await response.json()) as T;
}
