import "server-only";

import { adminFetch } from "@/lib/api";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function getContactMessages(): Promise<ContactMessage[]> {
  const response = await adminFetch("/admin/contact-messages");
  if (!response.ok) throw new Error(`Mesajlar yüklenemedi (HTTP ${response.status}).`);
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as ContactMessage[]) : [];
}

/** Okunmamış mesaj sayısı (hata olursa 0: menü rozeti için) */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await adminFetch("/admin/contact-messages/unread-count");
    if (!response.ok) return 0;
    const data = (await response.json()) as { count?: unknown };
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}
