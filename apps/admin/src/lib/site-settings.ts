import "server-only";

import { adminFetch } from "@/lib/api";

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
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const response = await adminFetch("/site-settings");

  if (!response.ok) {
    throw new Error(`Site ayarları yüklenemedi (HTTP ${response.status}).`);
  }

  return (await response.json()) as SiteSettings;
}

/** API'deki null değerleri form için boş metne çevirir */
export function pickSettings<K extends keyof SiteSettings>(s: SiteSettings, keys: K[]) {
  return Object.fromEntries(keys.map((k) => [k, s[k] ?? ""])) as Record<K, string | boolean>;
}
