import { HEX_COLOR_REGEX, imageUrlSchema } from "@/lib/validations/common";

/** Önizlemede yalnızca doğrulanmış renk style'a yazılır */
export function color(value: string | null | undefined): string | undefined {
  return value && HEX_COLOR_REGEX.test(value) ? value : undefined;
}

/** Önizlemede yalnızca doğrulanmış görsel adresi kullanılır */
export function image(value: string | null | undefined, mediaBaseUrl: string): string | undefined {
  if (!value || !imageUrlSchema.safeParse(value).success) return undefined;
  return value.startsWith("/media/") ? `${mediaBaseUrl}${value}` : value;
}

/** Arka plana göre okunur yazı rengi */
export function readable(bg: string | undefined): string | undefined {
  if (!bg) return undefined;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(bg.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#111827" : "#ffffff";
}

export type PreviewTheme = {
  primary: string;
  secondary: string;
  background: string;
  mediaBaseUrl: string;
};
