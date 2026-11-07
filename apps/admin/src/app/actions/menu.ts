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
const locationSchema = z.enum(["HEADER", "FOOTER"]);
type MenuLocation = z.infer<typeof locationSchema>;
const pathFor = (l: MenuLocation) =>
  l === "FOOTER" ? "/areas/footer" : "/areas/header";

function payload(v: MenuItemFormValues) {
  return {
    label: v.label,
    href: v.href,
    visible: v.visible,
    icon: v.icon === "" ? null : v.icon,
    parentId: v.parentId === "" ? null : v.parentId,
  };
}

export async function createMenuItemAction(
  values: MenuItemFormValues,
  location: MenuLocation = "HEADER",
): Promise<ActionResult> {
  const parsed = menuItemSchema.safeParse(values);
  const loc = locationSchema.safeParse(location);
  if (!parsed.success || !loc.success) return invalid();

  const { parentId, ...rest } = payload(parsed.data);
  // Footer linkleri tek seviyelidir
  const parent = loc.data === "FOOTER" ? null : parentId;

  return sendToApi(
    "/admin/menu-items",
    "POST",
    { ...rest, location: loc.data, ...(parent ? { parentId: parent } : {}) },
    "Menü öğesi oluşturulamadı.",
    pathFor(loc.data),
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
    "/areas/header",
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
    "/areas/header",
  );
}

export async function deleteMenuItemAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz menü öğesi.");

  return sendToApi(
    `/admin/menu-items/${id}`,
    "DELETE",
    undefined,
    "Menü öğesi silinemedi.",
    "/areas/header",
  );
}

export async function reorderMenuItemsAction(
  parentId: string | null,
  ids: string[],
  location: MenuLocation = "HEADER",
): Promise<ActionResult> {
  if (parentId !== null && !isUuid(parentId)) return invalid();
  if (!idList.safeParse(ids).success) return invalid();
  const loc = locationSchema.safeParse(location);
  if (!loc.success) return invalid();

  return sendToApi(
    "/admin/menu-items/reorder",
    "PATCH",
    { ids, location: loc.data, ...(parentId ? { parentId } : {}) },
    "Sıralama kaydedilemedi.",
    pathFor(loc.data),
  );
}
