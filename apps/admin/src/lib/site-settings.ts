import "server-only";

import { adminFetch } from "@/lib/api";
import { toTranslationsForm } from "@/lib/i18n";

export type SiteSettings = {
  siteName: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  backgroundImage: string | null;
  homeBackgroundColor: string | null;
  homeBackgroundImage: string | null;
  headerBackgroundColor: string | null;
  headerBackgroundImage: string | null;
  headerButtonText: string | null;
  headerButtonHref: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  allowIndexing: boolean;
  gaMeasurementId: string | null;
  notifyEmail: string | null;
  defaultLocale: string;
  locales: string[];
  /** Diğer dillerdeki metinler (site adı, SEO, header butonu) */
  translations: unknown;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  // Yönetim ucu: bildirim e-postası gibi iç alanlar yalnızca burada
  const response = await adminFetch("/admin/site-settings");

  if (!response.ok) {
    throw new Error(`Site ayarları yüklenemedi (HTTP ${response.status}).`);
  }

  return (await response.json()) as SiteSettings;
}

/** API'deki null değerleri form için boş metne çevirir */
export function pickSettings<K extends keyof SiteSettings>(s: SiteSettings, keys: K[], translatable: string[] = []) {
  const values = Object.fromEntries(keys.map((k) => [k, s[k] ?? ""])) as Record<string, unknown>;
  // Ekranın çevrilebilen alanları: form translations.<dil>.<alan> olarak düzenler
  if (translatable.length) values.translations = toTranslationsForm(s.translations, translatable);
  return values;
}
