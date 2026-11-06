"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ApiError, adminFetch, apiErrorMessage } from "@/lib/api";
import { emptyToNull } from "@/lib/validations/common";
import {
  sectionItemSchema,
  sectionSchema,
  type SectionFormValues,
  type SectionItemFormValues,
} from "@/lib/validations/section.schema";

type ActionResult = { success: true } | { success: false; error: string };

// Server action'lar dışarıdan çağrılabilir: her kimliği doğrula
const uuidSchema = z.uuid();
const idListSchema = z.array(z.uuid()).max(50);

function isUuid(value: unknown): value is string {
  return uuidSchema.safeParse(value).success;
}

function invalid(message = "Form bilgilerini kontrol edin."): ActionResult {
  return { success: false, error: message };
}

// Ortak istek gönderici: hata mesajlarını tek yerde toplar
async function send(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown,
  fallback: string,
): Promise<ActionResult> {
  try {
    const response = await adminFetch(path, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        success: false,
        error: apiErrorMessage(response.status, fallback),
      };
    }

    revalidatePath("/sections");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof ApiError
          ? error.message
          : "Beklenmeyen bir hata oluştu.",
    };
  }
}

function sectionPayload(v: SectionFormValues) {
  return {
    type: v.type,
    title: emptyToNull(v.title),
    subtitle: emptyToNull(v.subtitle),
    body: emptyToNull(v.body),
    backgroundColor: emptyToNull(v.backgroundColor),
    backgroundImage: emptyToNull(v.backgroundImage),
    textColor: emptyToNull(v.textColor),
    buttonText: emptyToNull(v.buttonText),
    buttonHref: emptyToNull(v.buttonHref),
    columns: v.columns,
    active: v.active,
  };
}

function itemPayload(v: SectionItemFormValues) {
  return {
    title: v.title,
    description: emptyToNull(v.description),
    imageUrl: emptyToNull(v.imageUrl),
    icon: emptyToNull(v.icon),
    buttonText: emptyToNull(v.buttonText),
    buttonHref: emptyToNull(v.buttonHref),
    backgroundColor: emptyToNull(v.backgroundColor),
    active: v.active,
  };
}

// Oluştururken boş alanları hiç gönderme
function withoutNulls<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null),
  );
}

// ───────────── BÖLÜMLER ─────────────

export async function createSectionAction(
  pageId: string | null,
  values: SectionFormValues,
): Promise<ActionResult> {
  if (pageId !== null && !isUuid(pageId)) return invalid("Geçersiz sayfa.");

  const parsed = sectionSchema.safeParse(values);
  if (!parsed.success) return invalid();

  return send(
    "/admin/sections",
    "POST",
    {
      ...withoutNulls(sectionPayload(parsed.data)),
      ...(pageId ? { pageId } : {}),
    },
    "Bölüm oluşturulamadı.",
  );
}

export async function updateSectionAction(
  id: string,
  values: SectionFormValues,
): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz bölüm.");

  const parsed = sectionSchema.safeParse(values);
  if (!parsed.success) return invalid();

  return send(
    `/admin/sections/${id}`,
    "PATCH",
    sectionPayload(parsed.data),
    "Bölüm güncellenemedi.",
  );
}

export async function setSectionActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  if (!isUuid(id) || typeof active !== "boolean") return invalid();

  return send(
    `/admin/sections/${id}`,
    "PATCH",
    { active },
    "Bölüm güncellenemedi.",
  );
}

export async function deleteSectionAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz bölüm.");

  return send(
    `/admin/sections/${id}`,
    "DELETE",
    undefined,
    "Bölüm silinemedi.",
  );
}

export async function reorderSectionsAction(
  pageId: string | null,
  ids: string[],
): Promise<ActionResult> {
  if (pageId !== null && !isUuid(pageId)) return invalid("Geçersiz sayfa.");
  if (!idListSchema.safeParse(ids).success) return invalid();

  return send(
    "/admin/sections/reorder",
    "PATCH",
    { ids, ...(pageId ? { pageId } : {}) },
    "Sıralama kaydedilemedi.",
  );
}

// ───────────── KARTLAR ─────────────

export async function createItemAction(
  sectionId: string,
  values: SectionItemFormValues,
): Promise<ActionResult> {
  if (!isUuid(sectionId)) return invalid("Geçersiz bölüm.");

  const parsed = sectionItemSchema.safeParse(values);
  if (!parsed.success) return invalid();

  return send(
    `/admin/sections/${sectionId}/items`,
    "POST",
    withoutNulls(itemPayload(parsed.data)),
    "Kart oluşturulamadı.",
  );
}

export async function updateItemAction(
  sectionId: string,
  itemId: string,
  values: SectionItemFormValues,
): Promise<ActionResult> {
  if (!isUuid(sectionId) || !isUuid(itemId)) return invalid("Geçersiz kart.");

  const parsed = sectionItemSchema.safeParse(values);
  if (!parsed.success) return invalid();

  return send(
    `/admin/sections/${sectionId}/items/${itemId}`,
    "PATCH",
    itemPayload(parsed.data),
    "Kart güncellenemedi.",
  );
}

export async function setItemActiveAction(
  sectionId: string,
  itemId: string,
  active: boolean,
): Promise<ActionResult> {
  if (!isUuid(sectionId) || !isUuid(itemId) || typeof active !== "boolean") {
    return invalid();
  }

  return send(
    `/admin/sections/${sectionId}/items/${itemId}`,
    "PATCH",
    { active },
    "Kart güncellenemedi.",
  );
}

export async function deleteItemAction(
  sectionId: string,
  itemId: string,
): Promise<ActionResult> {
  if (!isUuid(sectionId) || !isUuid(itemId)) return invalid("Geçersiz kart.");

  return send(
    `/admin/sections/${sectionId}/items/${itemId}`,
    "DELETE",
    undefined,
    "Kart silinemedi.",
  );
}

export async function reorderItemsAction(
  sectionId: string,
  ids: string[],
): Promise<ActionResult> {
  if (!isUuid(sectionId)) return invalid("Geçersiz bölüm.");
  if (!idListSchema.safeParse(ids).success) return invalid();

  return send(
    `/admin/sections/${sectionId}/items/reorder`,
    "PATCH",
    { ids },
    "Sıralama kaydedilemedi.",
  );
}
