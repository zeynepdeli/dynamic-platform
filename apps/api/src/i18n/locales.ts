/**
 * Desteklenen diller. Yeni dil eklemek: buraya kodu ve adını ekleyin; çeviri DTO'ları ve
 * admin dil sekmeleri bu listeden üretilir. Sitede hangilerinin açık olduğu SiteSettings.locales'tadır.
 */
export const SUPPORTED_LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' &&
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

/** Sitenin dil ayarı: ana dil (tablodaki asıl sütunlar) + açık diller */
export type LocaleConfig = { defaultLocale: Locale; locales: Locale[] };

/** Bozuk ya da eksik ayarı güvenli hâle getirir: ana dil her zaman açık dillerin ilkidir */
export function normalizeLocaleConfig(
  defaultLocale: unknown,
  locales: unknown,
): LocaleConfig {
  const def: Locale = isLocale(defaultLocale) ? defaultLocale : 'tr';
  const list = Array.isArray(locales) ? locales.filter(isLocale) : [];
  return {
    defaultLocale: def,
    locales: [
      def,
      ...SUPPORTED_LOCALES.filter((l) => l !== def && list.includes(l)),
    ],
  };
}

/**
 * İstenen dil (?lang=) → kullanılacak dil. Açık değilse ya da bilinmiyorsa ana dil.
 * Bilinmeyen dil hata vermez: eski/bozuk bağlantılar sayfayı ana dilde açar.
 */
export function resolveLocale(
  requested: unknown,
  config: LocaleConfig,
): Locale {
  return isLocale(requested) && config.locales.includes(requested)
    ? requested
    : config.defaultLocale;
}
