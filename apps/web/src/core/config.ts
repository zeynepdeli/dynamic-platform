import "server-only";

/** Sunucu tarafında API'ye ulaşılan adres (ör. http://api:4000) */
export function getApiUrl(): string {
  const url = process.env.API_URL?.replace(/\/$/, "");
  if (!url) {
    throw new Error("API_URL ortam değişkeni tanımlanmamış (.env.local).");
  }
  return url;
}

/**
 * Ziyaretçinin TARAYICISININ görsellere ulaşacağı adres
 * (ör. https://api.siteadi.com). Yoksa API_URL kullanılır.
 */
export function getMediaBaseUrl(): string {
  return (process.env.API_PUBLIC_URL ?? process.env.API_URL ?? "").replace(/\/$/, "");
}

/** Admin'deki değişikliklerin sitede görünme süresi (saniye) */
export const REVALIDATE_SECONDS = Number(process.env.REVALIDATE_SECONDS ?? 30);
