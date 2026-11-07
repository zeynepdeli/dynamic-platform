"use server";

import { z } from "zod";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { emptyToNull } from "@/lib/validations/common";
import {
  heroSlideSchema,
  type HeroSlideFormValues,
} from "@/lib/validations/hero-slide.schema";

const uuid = z.uuid();
const idList = z.array(z.uuid()).max(100);
const isUuid = (v: unknown): v is string => uuid.safeParse(v).success;

function payload(v: HeroSlideFormValues) {
  return {
    title: v.title,
    subtitle: emptyToNull(v.subtitle),
    description: emptyToNull(v.description),
    imageUrl: emptyToNull(v.imageUrl),
    mobileImageUrl: emptyToNull(v.mobileImageUrl),
    buttonText: emptyToNull(v.buttonText),
    buttonHref: emptyToNull(v.buttonHref),
    active: v.active,
  };
}

export async function createHeroSlideAction(
  values: HeroSlideFormValues,
): Promise<ActionResult> {
  const parsed = heroSlideSchema.safeParse(values);
  if (!parsed.success) return invalid();

  // Oluştururken boş alanları hiç gönderme
  const body = Object.fromEntries(
    Object.entries(payload(parsed.data)).filter(([, v]) => v !== null),
  );

  return sendToApi(
    "/admin/hero-slides",
    "POST",
    body,
    "Slider oluşturulamadı.",
    "/pages/home",
  );
}

export async function updateHeroSlideAction(
  id: string,
  values: HeroSlideFormValues,
): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz slider.");

  const parsed = heroSlideSchema.safeParse(values);
  if (!parsed.success) return invalid();

  return sendToApi(
    `/admin/hero-slides/${id}`,
    "PATCH",
    payload(parsed.data),
    "Slider güncellenemedi.",
    "/pages/home",
  );
}

export async function setHeroSlideActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  if (!isUuid(id) || typeof active !== "boolean") return invalid();

  return sendToApi(
    `/admin/hero-slides/${id}`,
    "PATCH",
    { active },
    "Slider güncellenemedi.",
    "/pages/home",
  );
}

export async function deleteHeroSlideAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz slider.");

  return sendToApi(
    `/admin/hero-slides/${id}`,
    "DELETE",
    undefined,
    "Slider silinemedi.",
    "/pages/home",
  );
}

export async function reorderHeroSlidesAction(
  ids: string[],
): Promise<ActionResult> {
  if (!idList.safeParse(ids).success) return invalid();

  return sendToApi(
    "/admin/hero-slides/reorder",
    "PATCH",
    { ids },
    "Sıralama kaydedilemedi.",
    "/pages/home",
  );
}
