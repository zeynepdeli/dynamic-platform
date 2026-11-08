import "server-only";

import { adminFetch } from "@/lib/api";

export type AdminAccount = { id: string; email: string; active: boolean; createdAt: string };

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  const response = await adminFetch("/admin/users");
  if (!response.ok) throw new Error(`Yöneticiler yüklenemedi (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as AdminAccount[]) : [];
}

export async function getMailConfigured(): Promise<boolean> {
  try {
    const response = await adminFetch("/admin/mail/status");
    if (!response.ok) return false;
    return ((await response.json()) as { configured?: unknown }).configured === true;
  } catch {
    return false;
  }
}
