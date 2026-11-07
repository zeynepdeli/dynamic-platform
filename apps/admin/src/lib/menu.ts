import "server-only";

import { adminFetch } from "@/lib/api";
import type { MenuItemFormValues } from "@/lib/validations/menu.schema";

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  order: number;
  visible: boolean;
  parentId: string | null;
};

export type MenuNode = MenuItem & {
  formValues: MenuItemFormValues;
  children: (MenuItem & { formValues: MenuItemFormValues })[];
};

export async function getAdminMenuItems(): Promise<MenuItem[]> {
  const response = await adminFetch("/admin/menu-items");

  if (!response.ok) {
    throw new Error(`Menü yüklenemedi (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as MenuItem[]) : [];
}

export function toMenuFormValues(item: MenuItem): MenuItemFormValues {
  return {
    label: item.label,
    href: item.href,
    parentId: item.parentId ?? "",
    visible: item.visible,
  };
}

// Düz listeyi 2 seviyeli ağaca çevirir (sıralı)
export function buildMenuTree(items: MenuItem[]): MenuNode[] {
  const byOrder = (a: MenuItem, b: MenuItem) => a.order - b.order;
  const withForm = (item: MenuItem) => ({
    ...item,
    formValues: toMenuFormValues(item),
  });

  return items
    .filter((item) => item.parentId === null)
    .sort(byOrder)
    .map((root) => ({
      ...withForm(root),
      children: items
        .filter((item) => item.parentId === root.id)
        .sort(byOrder)
        .map(withForm),
    }));
}
