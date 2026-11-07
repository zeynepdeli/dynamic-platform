"use server";

import { z } from "zod";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { emptyToNull } from "@/lib/validations/common";
import {
  MAX_SOCIAL_LINKS,
  socialLinkSchema,
  type SocialLinkFormValues,
} from "@/lib/validations/social-link.schema";

const uuid = z.uuid();
const isUuid = (v: unknown): v is string => uuid.safeParse(v).success;

function payload(v: SocialLinkFormValues) {
  return {
    icon: v.icon,
    url: v.url,
    label: emptyToNull(v.label),
    visible: v.visible,
  };
}

export async function createSocialLinkAction(
  values: SocialLinkFormValues,
): Promise<ActionResult> {
  const parsed = socialLinkSchema.safeParse(values);
  if (!parsed.success) return invalid();
  return sendToApi(
    "/admin/social-links",
    "POST",
    payload(parsed.data),
    "Bağlantı eklenemedi.",
    "/settings",
  );
}

export async function updateSocialLinkAction(
  id: string,
  values: SocialLinkFormValues,
): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz bağlantı.");
  const parsed = socialLinkSchema.safeParse(values);
  if (!parsed.success) return invalid();
  return sendToApi(
    `/admin/social-links/${id}`,
    "PATCH",
    payload(parsed.data),
    "Bağlantı güncellenemedi.",
    "/settings",
  );
}

export async function deleteSocialLinkAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz bağlantı.");
  return sendToApi(
    `/admin/social-links/${id}`,
    "DELETE",
    undefined,
    "Bağlantı silinemedi.",
    "/settings",
  );
}

export async function reorderSocialLinksAction(ids: string[]): Promise<ActionResult> {
  const parsed = z.array(z.uuid()).max(MAX_SOCIAL_LINKS).safeParse(ids);
  if (!parsed.success || new Set(parsed.data).size !== parsed.data.length) {
    return invalid();
  }
  return sendToApi(
    "/admin/social-links/reorder",
    "PATCH",
    { ids: parsed.data },
    "Sıralama kaydedilemedi.",
    "/settings",
  );
}
