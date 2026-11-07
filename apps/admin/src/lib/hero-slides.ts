import "server-only";

import { adminFetch } from "@/lib/api";
import type { HeroSlideFormValues } from "@/lib/validations/hero-slide.schema";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  order: number;
  active: boolean;
};

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  const response = await adminFetch("/admin/hero-slides");

  if (!response.ok) {
    throw new Error(`Slider'lar yüklenemedi (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as HeroSlide[]) : [];
}

export function toHeroSlideFormValues(slide: HeroSlide): HeroSlideFormValues {
  return {
    title: slide.title,
    subtitle: slide.subtitle ?? "",
    description: slide.description ?? "",
    imageUrl: slide.imageUrl ?? "",
    mobileImageUrl: slide.mobileImageUrl ?? "",
    buttonText: slide.buttonText ?? "",
    buttonHref: slide.buttonHref ?? "",
    active: slide.active,
  };
}
