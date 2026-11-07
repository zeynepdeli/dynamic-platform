"use server";

import { z } from "zod";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import {
  menuItemSchema,
  type MenuItemFormValues,
} from "@/lib/validations/menu.schema";

const uuid = z.uuid();
const idList = z.array(z.uuid()).max(100);
const isUuid = (v: unknown): v is string => uuid.safeParse(v).success;

function payload(v: MenuItemFormValues) {
  return {
    label: v.label,
    href: v.href,
    visible: v.visible,
    parentId: v.parentId === "" ? null : v.parentId,
  };
}

export async function createMenuItemAction(
  values: MenuItemFormValues,
): Promise<ActionResult> {
  const parsed = menuItemSchema.safeParse(values);
  if (!parsed.success) return invalid();

  const { parentId, ...rest } = payload(parsed.data);

  return sendToApi(
    "/admin/menu-items",
    "POST",
    { ...rest, ...(parentId ? { parentId } : {}) },
    "Menü öğesi oluşturulamadı.",
    "/menu",
  );
}

export async function updateMenuItemAction(
  id: string,
  values: MenuItemFormValues,
): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz menü öğesi.");

  const parsed = menuItemSchema.safeParse(values);
  if (!parsed.success) return invalid();

  return sendToApi(
    `/admin/menu-items/${id}`,
    "PATCH",
    payload(parsed.data),
    "Menü öğesi güncellenemedi.",
    "/menu",
  );
}

export async function setMenuItemVisibleAction(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  if (!isUuid(id) || typeof visible !== "boolean") return invalid();

  return sendToApi(
    `/admin/menu-items/${id}`,
    "PATCH",
    { visible },
    "Menü öğesi güncellenemedi.",
    "/menu",
  );
}

export async function deleteMenuItemAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz menü öğesi.");

  return sendToApi(
    `/admin/menu-items/${id}`,
    "DELETE",
    undefined,
    "Menü öğesi silinemedi.",
    "/menu",
  );
}

export async function reorderMenuItemsAction(
  parentId: string | null,
  ids: string[],
): Promise<ActionResult> {
  if (parentId !== null && !isUuid(parentId)) return invalid();
  if (!idList.safeParse(ids).success) return invalid();

  return sendToApi(
    "/admin/menu-items/reorder",
    "PATCH",
    { ids, ...(parentId ? { parentId } : {}) },
    "Sıralama kaydedilemedi.",
    "/menu",
  );
}
