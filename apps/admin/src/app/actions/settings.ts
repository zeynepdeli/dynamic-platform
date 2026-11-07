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
};

// Boş bırakılabilen (null'a çevrilen) alanlar dışındakiler olduğu gibi gider
const REQUIRED = new Set(["siteName", "backgroundColor", "primaryColor", "secondaryColor"]);

/**
 * Ortak alan ekranlarını kaydeder. Grup ve değerler sunucuda YENİDEN
 * doğrulanır; yalnızca o grubun alanları API'ye gider.
 */
export async function updateSettingsAction(group: SettingsGroup, values: unknown): Promise<ActionResult> {
  if (!Object.hasOwn(settingsSchemas, group)) return invalid();

  const parsed = settingsSchemas[group].safeParse(values);
  if (!parsed.success) return invalid();

  const payload: Record<string, string | boolean | null> = {};
  for (const [key, value] of Object.entries(parsed.data as Record<string, string | boolean>)) {
    payload[key] = typeof value === "string" && !REQUIRED.has(key) ? emptyToNull(value) : value;
  }

  return sendToApi(
    group === "footer" ? "/admin/footer-settings" : "/admin/site-settings",
    "PATCH",
    payload,
    "Ayarlar kaydedilemedi.",
    PATHS[group],
  );
}
