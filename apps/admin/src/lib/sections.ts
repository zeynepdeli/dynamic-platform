import "server-only";

import { adminFetch } from "@/lib/api";
import { toTranslationsForm } from "@/lib/i18n";
import {
  ITEM_TRANSLATABLE,
  SECTION_TRANSLATABLE,
  type SectionFormValues,
  type SectionItemFormValues,
  type SectionType,
} from "@/lib/validations/section.schema";

export type SectionItem = {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  subtitle?: string | null;
  rating?: number | null;
  linkUrl?: string | null;
  order: number;
  active: boolean;
  translations?: unknown;
};

export type Section = {
  id: string;
  pageId: string | null;
  key: string | null;
  type: SectionType;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  textColor: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  columns: number;
  videoUrl: string | null;
  mapAddress: string | null;
  order: number;
  active: boolean;
  translations?: unknown;
  items: SectionItem[];
};

// pageId = null → ana sayfa bölümleri
export async function getAdminSections(
  pageId: string | null,
): Promise<Section[]> {
  const query = pageId ? `?pageId=${encodeURIComponent(pageId)}` : "";
  const response = await adminFetch(`/admin/sections${query}`);

  if (!response.ok) {
    throw new Error(`Bölümler yüklenemedi (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as Section[]) : [];
}

// API'deki null değerleri form için boş string'e çevir
export function toSectionFormValues(section: Section): SectionFormValues {
  return {
    key: section.key ?? "",
    type: section.type,
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    body: section.body ?? "",
    backgroundColor: section.backgroundColor ?? "",
    backgroundImage: section.backgroundImage ?? "",
    textColor: section.textColor ?? "",
    buttonText: section.buttonText ?? "",
    buttonHref: section.buttonHref ?? "",
    columns: section.columns,
    videoUrl: section.videoUrl ?? "",
    mapAddress: section.mapAddress ?? "",
    active: section.active,
    translations: toTranslationsForm(section.translations, SECTION_TRANSLATABLE),
  };
}

export function toSectionItemFormValues(
  item: SectionItem,
): SectionItemFormValues {
  return {
    title: item.title,
    description: item.description ?? "",
    imageUrl: item.imageUrl ?? "",
    icon: item.icon ?? "",
    buttonText: item.buttonText ?? "",
    buttonHref: item.buttonHref ?? "",
    backgroundColor: item.backgroundColor ?? "",
    backgroundImage: item.backgroundImage ?? "",
    subtitle: item.subtitle ?? "",
    rating: toRating(item.rating),
    linkUrl: item.linkUrl ?? "",
    active: item.active,
    translations: toTranslationsForm(item.translations, ITEM_TRANSLATABLE),
  };
}

const RATINGS = ["1", "2", "3", "4", "5"] as const;
function toRating(value: number | null | undefined): SectionItemFormValues["rating"] {
  const r = String(value ?? "");
  return (RATINGS as readonly string[]).includes(r) ? (r as SectionItemFormValues["rating"]) : "";
}
