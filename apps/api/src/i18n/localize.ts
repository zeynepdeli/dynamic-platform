import type { Locale } from './locales.js';

/**
 * Çevirisi tutulan alanlar (model başına beyaz liste). Asıl sütunlar sitenin ana dilindedir;
 * diğer dillerin değerleri satırdaki `translations` JSON'unda: { "en": { "title": "…" } }.
 */
export const TRANSLATABLE = {
  siteSettings: [
    'siteName',
    'description',
    'headerButtonText',
    'headerButtonHref',
    'metaTitle',
    'metaDescription',
    'metaKeywords',
  ],
  menuItem: ['label', 'href'],
  heroSlide: ['title', 'subtitle', 'description', 'buttonText', 'buttonHref'],
  page: [
    'title',
    'slug',
    'content',
    'seoTitle',
    'seoDescription',
    'seoKeywords',
  ],
  section: ['title', 'subtitle', 'body', 'buttonText', 'buttonHref'],
  sectionItem: ['title', 'subtitle', 'description', 'buttonText', 'buttonHref'],
  footer: ['description', 'copyright', 'address'],
  media: ['alt'],
} as const;

type Row = { translations?: unknown } & Record<string, unknown>;

/** Satırın bir dildeki çeviri nesnesi (yoksa boş) */
export function translationOf(
  row: { translations?: unknown },
  locale: Locale,
): Record<string, unknown> {
  const all = row.translations;
  if (!all || typeof all !== 'object' || Array.isArray(all)) return {};
  const t = (all as Record<string, unknown>)[locale];
  return t && typeof t === 'object' && !Array.isArray(t)
    ? (t as Record<string, unknown>)
    : {};
}

/**
 * Satırı istenen dile çevirir ve `translations` alanını çıkarır (ziyaretçiye ham çeviri gitmez).
 * Çevirisi boş olan alan ana dildeki değeriyle kalır: site hiçbir dilde boş görünmez.
 */
export function localize<T extends Row>(
  row: T,
  locale: Locale,
  defaultLocale: Locale,
  fields: readonly string[],
): Omit<T, 'translations'> {
  const { translations: _t, ...rest } = row;
  if (locale === defaultLocale) return rest;
  const t = translationOf(row, locale);
  const out: Record<string, unknown> = { ...rest };
  for (const field of fields) {
    const value = t[field];
    if (typeof value === 'string' && value.trim() !== '') out[field] = value;
  }
  return out as Omit<T, 'translations'>;
}

/**
 * Admin'den gelen çevirileri kayıttakilerle alan alan birleştirir: gönderilen alan yazılır
 * (boş metin = o alanın çevirisini sil), gönderilmeyen alanlar ve diller korunur.
 * Böylece aynı kaydın farklı ekranları (ör. site ayarlarında Header ve SEO) birbirini ezmez.
 */
export function mergeTranslations(
  current: unknown,
  incoming: Partial<Record<string, object | undefined>> | undefined,
): Record<string, Record<string, string>> | undefined {
  if (!incoming) return undefined;
  const base =
    current && typeof current === 'object' && !Array.isArray(current)
      ? (structuredClone(current) as Record<string, Record<string, string>>)
      : {};
  for (const [locale, fields] of Object.entries(incoming)) {
    if (!fields) continue;
    const merged: Record<string, string> = { ...(base[locale] ?? {}) };
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value !== 'string') continue;
      if (value.trim() === '') delete merged[key];
      else merged[key] = value.trim();
    }
    if (Object.keys(merged).length) base[locale] = merged;
    else delete base[locale];
  }
  return base;
}

/** Sayfanın bir dildeki adresi (slug): çevirisi yoksa ana dildeki slug */
export function slugFor(
  page: { slug: string; translations?: unknown },
  locale: Locale,
  defaultLocale: Locale,
): string {
  if (locale === defaultLocale) return page.slug;
  const t = translationOf(page, locale).slug;
  return typeof t === 'string' && t.trim() !== '' ? t : page.slug;
}

/** Sitedeki yol: ana dil önek almaz (/hakkimizda), diğerleri alır (/en/about-us) */
export function pathFor(
  locale: Locale,
  defaultLocale: Locale,
  slug: string | null,
): string {
  if (locale === defaultLocale) return slug ? `/${slug}` : '/';
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

/**
 * Site içi bağlantıyı dile göre çevirir: "/hakkimizda" → "/en/about-us" (sayfanın EN adresi),
 * "/" → "/en", bilinmeyen yol → "/en/…". Zaten "/en" ile başlıyorsa olduğu gibi kalır.
 * slugMap: ana dildeki slug → o dildeki slug.
 */
export function localizeHref(
  href: string | null | undefined,
  locale: Locale,
  defaultLocale: Locale,
  slugMap: ReadonlyMap<string, string>,
): string | null {
  if (!href || locale === defaultLocale || !href.startsWith('/'))
    return href ?? null;
  if (
    href === `/${locale}` ||
    href.startsWith(`/${locale}/`) ||
    href.startsWith(`/${locale}?`) ||
    href.startsWith(`/${locale}#`)
  )
    return href;
  const m = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)?(.*)$/.exec(href);
  if (!m) return `/${locale}${href}`;
  const [, seg, rest] = m;
  if (!seg) return `/${locale}${rest === '/' ? '' : rest}`;
  return `/${locale}/${slugMap.get(seg) ?? seg}${rest}`;
}
