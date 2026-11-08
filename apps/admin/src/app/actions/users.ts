"use server";

import { z } from "zod";

import { adminFetch, readApiError } from "@/lib/api";
import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { newAdminSchema } from "@/lib/validations/users.schema";

export async function createAdminAction(values: unknown): Promise<ActionResult> {
  const parsed = newAdminSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);
  return sendToApi("/admin/users", "POST", { email: parsed.data.email, password: parsed.data.password }, "Yönetici eklenemedi.", "/users");
}

export async function setAdminActiveAction(id: string, active: boolean): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success || typeof active !== "boolean") return invalid();
  return sendToApi(`/admin/users/${id}`, "PATCH", { active }, "Güncellenemedi.", "/users");
}

export async function sendTestMailAction(): Promise<{ success: true; to: string } | { success: false; error: string }> {
  try {
    const response = await adminFetch("/admin/mail/test", { method: "POST" });
    if (response.ok) {
      const data = (await response.json()) as { to?: unknown };
      return { success: true, to: typeof data.to === "string" ? data.to : "" };
    }
    if (response.status === 503) {
      const body = (await response.json().catch(() => ({}))) as { message?: unknown };
      return { success: false, error: typeof body.message === "string" ? body.message : "E-posta gönderilemedi." };
    }
    if (response.status === 429) return { success: false, error: "Çok fazla deneme. Bir dakika sonra tekrar deneyin." };
    return { success: false, error: await readApiError(response, "E-posta gönderilemedi.") };
  } catch {
    return { success: false, error: "Sunucuya ulaşılamadı." };
  }
}
