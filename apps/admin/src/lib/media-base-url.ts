import "server-only";

/**
 * Önizlemelerde /media/... görsellerini göstermek için TARAYICININ
 * erişebileceği API adresi. (API_URL sunucu içi bir adres olabilir.)
 */
export function getMediaBaseUrl(): string {
  // Boş bırakılan satır (API_PUBLIC_URL=) "tanımsız" sayılır: || kullanılır, ?? değil
  return (process.env.API_PUBLIC_URL?.trim() || process.env.API_URL?.trim() || "").replace(/\/$/, "");
}
