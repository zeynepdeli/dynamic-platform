/**
 * Frontend tarafı doğrulayıcılar (defense in depth).
 *
 * Veriler API'de zaten doğrulanıyor; burada TEKRAR kontrol ediyoruz ki
 * API'de bir hata olsa ya da veritabanına başka yoldan veri girilse bile
 * sitede XSS / CSS injection / açık yönlendirme oluşmasın.
 *
 * Kural: admin'den gelen hiçbir değer doğrulanmadan
 *   - style={...} içine,
 *   - href / src attribute'una
 * yazılmaz. Metinler her zaman React ile (otomatik kaçışlı) basılır,
 * dangerouslySetInnerHTML KULLANILMAZ.
 */

import { getMediaBaseUrl } from "./config";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const LOCAL_MEDIA =
  /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

// API ile aynı kural: "/" ile başlar, "//" veya "/\" ile başlamaz,
// ters eğik çizgi / boşluk / kontrol karakteri içermez.
const INTERNAL_PATH =
  /^\/(?![/\\])[^\s\\\x00-\x1f\x7f?#]*(?:\?[^\s\\\x00-\x1f\x7f#]*)?(?:#[^\s\\\x00-\x1f\x7f]*)?$/;

/** #RRGGBB değilse undefined (stil hiç yazılmaz) */
export function safeColor(value: string | null | undefined): string | undefined {
  return value && HEX_COLOR.test(value) ? value : undefined;
}

/** https:// adresi mi? (kullanıcı adı/şifre içeremez) */
export function safeHttpsUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Görsel adresi: /media/<uuid>.(jpg|png|webp) → API adresiyle tamamlanır,
 * ya da harici https adresi. Diğer her şey (javascript:, data:, http:) → undefined
 */
export function safeImageSrc(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (LOCAL_MEDIA.test(value)) return `${getMediaBaseUrl()}${value}`;
  return safeHttpsUrl(value);
}

/** Site içi bağlantı değilse undefined (link hiç çizilmez) */
export function safeInternalHref(value: string | null | undefined): string | undefined {
  return value && INTERNAL_PATH.test(value) ? value : undefined;
}

/** mailto: bağlantısı için basit e-posta kontrolü */
export function safeMailto(value: string | null | undefined): string | undefined {
  return value && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value)
    ? `mailto:${value}`
    : undefined;
}

/** tel: bağlantısı — yalnızca rakam ve + bırakılır */
export function safeTel(value: string | null | undefined): string | undefined {
  const digits = value?.replace(/[^\d+]/g, "") ?? "";
  return digits.length >= 7 ? `tel:${digits}` : undefined;
}

/**
 * Arka plan rengine göre okunabilir yazı rengi (WCAG göreli parlaklık).
 * Admin yazı rengi seçmediyse kullanılır.
 */
export function readableTextColor(background: string | undefined): string | undefined {
  if (!background) return undefined;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(background.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? "#111827" : "#ffffff";
}
