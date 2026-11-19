/**
 * Panelde tarih/saat girişi Türkiye saatiyle yapılır (UTC+3, yaz saati uygulaması yok).
 * Sunucu ve tarayıcı aynı sonucu üretsin diye sabit dilim kullanılır (hydration farkı olmaz).
 */
const OFFSET = "+03:00";
const OFFSET_MS = 3 * 60 * 60 * 1000;
export const LOCAL_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** ISO → "2026-11-19T15:30" (datetime-local alanı için) */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 16);
}

/** "2026-11-19T15:30" → ISO (UTC). Boş/geçersiz → null */
export function localInputToIso(value: string): string | null {
  if (!LOCAL_DATETIME_REGEX.test(value)) return null;
  const date = new Date(`${value}:00${OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Türkçe karakterleri dönüştürüp adres (slug) üretir: "Yeni Ürün Çıktı!" → "yeni-urun-cikti" */
export function slugify(text: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150)
    .replace(/-+$/g, "");
}
