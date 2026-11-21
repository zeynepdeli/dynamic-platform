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
  // Boş bırakılan satır (API_PUBLIC_URL=) "tanımsız" sayılır: || kullanılır, ?? değil
  return (process.env.API_PUBLIC_URL?.trim() || process.env.API_URL?.trim() || "").replace(/\/$/, "");
}

/** Admin'deki değişikliklerin sitede görünme süresi (saniye) */
export const REVALIDATE_SECONDS = (() => {
  const value = Number(process.env.REVALIDATE_SECONDS?.trim() || 30);
  return Number.isFinite(value) && value >= 0 ? value : 30;
})();

/** Sitenin herkese açık adresi (ör. https://siteadi.com) — sitemap ve paylaşım için */
export function getSiteUrl(): string | undefined {
  const url = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.hostname === "localhost" ? parsed.origin : undefined;
  } catch {
    return undefined;
  }
}
