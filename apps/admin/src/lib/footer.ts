import "server-only";

import { adminFetch } from "@/lib/api";
import type { FooterFormValues } from "@/lib/validations/footer.schema";

type FooterSettings = { [K in keyof FooterFormValues]: FooterFormValues[K] | null };

export async function getFooterFormValues(): Promise<FooterFormValues> {
  const response = await adminFetch("/admin/footer-settings");

  if (!response.ok) {
    throw new Error(`Footer ayarları yüklenemedi (HTTP ${response.status}).`);
  }

  const s = (await response.json()) as FooterSettings;

  return {
    enabled: s.enabled ?? true,
    backgroundColor: s.backgroundColor ?? "",
    backgroundImage: s.backgroundImage ?? "",
    description: s.description ?? "",
    copyright: s.copyright ?? "",
    email: s.email ?? "",
    phone: s.phone ?? "",
    address: s.address ?? "",
  };
}
