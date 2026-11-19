"use server";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { emptyToNull } from "@/lib/validations/common";
import {
  settingsSchemas,
  type SettingsGroup,
} from "@/lib/validations/settings.schema";

const PATHS: Record<SettingsGroup, string> = {
  header: "/areas/header",
  background: "/areas/background",
  theme: "/areas/theme",
  seo: "/areas/seo",
  footer: "/areas/footer",
  notify: "/messages",
};

// Boş bırakılamayan alanlar (grup başına): bunlar olduğu gibi gider, diğer boş metinler null olur.
// Footer'ın arka plan rengi isteğe bağlıdır; site arka planınınki zorunludur (aynı ad, farklı kural).
const REQUIRED: Partial<Record<SettingsGroup, ReadonlySet<string>>> = {
  header: new Set(["siteName"]),
  background: new Set(["backgroundColor"]),
  theme: new Set(["primaryColor", "secondaryColor"]),
};

/**
 * Ortak alan ekranlarını kaydeder. Grup ve değerler sunucuda YENİDEN
 * doğrulanır; yalnızca o grubun alanları API'ye gider.
 */
export async function updateSettingsAction(group: SettingsGroup, values: unknown): Promise<ActionResult> {
  if (!Object.hasOwn(settingsSchemas, group)) return invalid();

  const parsed = settingsSchemas[group].safeParse(values);
  if (!parsed.success) return invalid();

  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data as Record<string, unknown>)) {
    // Çeviriler olduğu gibi gider (boş metin = o alanın çevirisini sil; API alan alan birleştirir)
    if (key === "translations") payload[key] = value;
    else payload[key] = typeof value === "string" && !REQUIRED[group]?.has(key) ? emptyToNull(value) : value;
  }

  return sendToApi(
    group === "footer" ? "/admin/footer-settings" : "/admin/site-settings",
    "PATCH",
    payload,
    "Ayarlar kaydedilemedi.",
    PATHS[group],
  );
}
