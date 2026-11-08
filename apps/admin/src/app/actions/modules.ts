"use server";

import { revalidatePath } from "next/cache";

import { moduleByKey } from "@/brand/modules";
import { adminFetch, readApiError } from "@/lib/api";
import type { ActionResult } from "@/lib/admin/send";

type Json = Record<string, unknown>;

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const response = await adminFetch(path, init);
  if (!response.ok)
    return {
      ok: false,
      error: await readApiError(response, "İşlem tamamlanamadı."),
    };
  return { ok: true, data: (await response.json()) as T };
}

/**
 * Modülü kur: sayfa yoksa oluştur, eksik bölümleri ekle, istenirse menüye ekle.
 * Tekrar çalıştırılırsa yalnızca eksikleri tamamlar (zarar vermez).
 */
export async function setupModuleAction(
  key: string,
  addToMenu: boolean,
): Promise<ActionResult> {
  const mod = typeof key === "string" ? moduleByKey(key) : undefined;
  if (!mod || typeof addToMenu !== "boolean")
    return { success: false, error: "Geçersiz modül." };

  const pages = await api<{ id: string; slug: string }[]>("/admin/pages");
  if (!pages.ok) return { success: false, error: pages.error };

  let pageId = pages.data.find((p) => p.slug === mod.slug)?.id;

  // Daha önce çöp kutusuna taşındıysa yenisini açmak yerine geri yükle
  // (adres hâlâ ona ait olduğu için yeni sayfa oluşturulamaz)
  if (!pageId) {
    const trash = await api<{ id: string; slug: string }[]>("/admin/pages/trash");
    const trashed = trash.ok ? trash.data.find((p) => p.slug === mod.slug) : undefined;
    if (trashed) {
      const restored = await api<Json>(`/admin/pages/${trashed.id}/restore`, { method: "PATCH" });
      if (!restored.ok) return { success: false, error: restored.error };
      // Çöpten dönen sayfa taslak olarak gelir; "Kur" diyen kullanıcı yayında bekler
      const published = await api<Json>(`/admin/pages/${trashed.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: true }),
      });
      if (!published.ok) return { success: false, error: published.error };
      pageId = trashed.id;
    }
  }

  if (!pageId) {
    const created = await api<{ id: string }>("/admin/pages", {
      method: "POST",
      body: JSON.stringify({
        title: mod.pageTitle,
        slug: mod.slug,
        published: true,
      }),
    });
    if (!created.ok) return { success: false, error: created.error };
    pageId = created.data.id;
  }

  const sections = await api<{ key: string | null }[]>(
    `/admin/sections?pageId=${pageId}`,
  );
  if (!sections.ok) return { success: false, error: sections.error };
  const existing = new Set(sections.data.map((s) => s.key));

  for (const entry of mod.template.sections) {
    if (existing.has(entry.key)) continue;
    const created = await api<Json>("/admin/sections", {
      method: "POST",
      body: JSON.stringify({
        pageId,
        key: entry.key,
        type: entry.type,
        title: entry.label,
        active: true,
      }),
    });
    if (!created.ok) return { success: false, error: created.error };
  }

  if (addToMenu) {
    const menu =
      await api<{ href: string; location?: string }[]>("/admin/menu-items");
    if (
      menu.ok &&
      !menu.data.some(
        (m) =>
          m.href === `/${mod.slug}` && (m.location ?? "HEADER") === "HEADER",
      )
    ) {
      await api<Json>("/admin/menu-items", {
        method: "POST",
        body: JSON.stringify({
          label: mod.pageTitle,
          href: `/${mod.slug}`,
          location: "HEADER",
        }),
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/modules/${mod.key}`);
  return { success: true };
}
