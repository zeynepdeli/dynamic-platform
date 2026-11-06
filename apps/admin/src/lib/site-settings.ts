import "server-only";

import { adminFetch } from "@/lib/api";
import type { AppearanceFormValues } from "@/lib/validations/appearance.schema";

export type SiteSettings = {
  siteName: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundType: "COLOR" | "IMAGE";
  backgroundColor: string;
  backgroundImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const response = await adminFetch("/site-settings");

  if (!response.ok) {
    throw new Error(`Site ayarları yüklenemedi (HTTP ${response.status}).`);
  }

  return (await response.json()) as SiteSettings;
}

/** API'den gelen null değerleri form için boş string'e çevirir */
export function toAppearanceFormValues(s: SiteSettings): AppearanceFormValues {
  return {
    siteName: s.siteName,
    description: s.description ?? "",
    logoUrl: s.logoUrl ?? "",
    faviconUrl: s.faviconUrl ?? "",
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
    backgroundType: s.backgroundType,
    backgroundColor: s.backgroundColor,
    backgroundImage: s.backgroundImage ?? "",
    metaTitle: s.metaTitle ?? "",
    metaDescription: s.metaDescription ?? "",
  };
}
