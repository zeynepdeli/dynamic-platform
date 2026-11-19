"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { adminFetch, readApiError } from "@/lib/api";
import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { localInputToIso } from "@/lib/datetime";
import { emptyToNull } from "@/lib/validations/common";
import { postSchema, type PostFormValues } from "@/lib/validations/post.schema";

const isUuid = (v: unknown): v is string => z.uuid().safeParse(v).success;

function payload(v: PostFormValues) {
  return {
    title: v.title,
    slug: v.slug,
    excerpt: emptyToNull(v.excerpt),
    content: emptyToNull(v.content),
    coverImageUrl: emptyToNull(v.coverImageUrl),
    category: emptyToNull(v.category),
    published: v.published,
    publishedAt: localInputToIso(v.publishedAt),
    seoTitle: emptyToNull(v.seoTitle),
    seoDescription: emptyToNull(v.seoDescription),
    translations: v.translations,
  };
}

/** Oluşturur; başarılıysa yeni yazının id'si döner (düzenleme ekranına geçmek için) */
export async function createPostAction(
  values: PostFormValues,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const parsed = postSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: "Form bilgilerini kontrol edin." };
  const body = Object.fromEntries(Object.entries(payload(parsed.data)).filter(([, v]) => v !== null));
  try {
    const response = await adminFetch("/admin/posts", { method: "POST", body: JSON.stringify(body) });
    if (!response.ok) return { success: false, error: await readApiError(response, "Yazı oluşturulamadı.") };
    const created = (await response.json()) as { id?: unknown };
    if (!isUuid(created.id)) return { success: false, error: "Yazı oluşturulamadı." };
    revalidatePath("/blog");
    return { success: true, id: created.id };
  } catch {
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function updatePostAction(id: string, values: PostFormValues): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz yazı.");
  const parsed = postSchema.safeParse(values);
  if (!parsed.success) return invalid();
  return sendToApi(`/admin/posts/${id}`, "PATCH", payload(parsed.data), "Yazı kaydedilemedi.", "/blog");
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid("Geçersiz yazı.");
  return sendToApi(`/admin/posts/${id}`, "DELETE", undefined, "Yazı silinemedi.", "/blog");
}
