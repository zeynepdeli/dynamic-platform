import { z } from "zod";

export const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const LOCAL_MEDIA_REGEX =
  /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export const hexColorSchema = z
  .string()
  .trim()
  .regex(HEX_COLOR_REGEX, "Renk #RRGGBB formatında olmalıdır.");

/** Boş string = alan temizlenecek */
export const imageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value === "" || LOCAL_MEDIA_REGEX.test(value) || isSafeHttpsUrl(value),
    "Medya kütüphanesinden (/media/...) veya https:// ile başlayan bir adres girin.",
  );

/** Boş string'i API için null'a çevirir */
export function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}
