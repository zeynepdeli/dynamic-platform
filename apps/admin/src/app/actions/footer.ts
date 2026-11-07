"use server";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";
import { emptyToNull } from "@/lib/validations/common";
import {
  footerSchema,
  type FooterFormValues,
} from "@/lib/validations/footer.schema";

export async function updateFooterAction(
  values: FooterFormValues,
): Promise<ActionResult> {
  const parsed = footerSchema.safeParse(values);
  if (!parsed.success) return invalid();

  const v = parsed.data;

  return sendToApi(
    "/admin/footer-settings",
    "PATCH",
    {
      enabled: v.enabled,
      description: emptyToNull(v.description),
      copyright: emptyToNull(v.copyright),
      email: emptyToNull(v.email),
      phone: emptyToNull(v.phone),
      address: emptyToNull(v.address),
    },
    "Ayarlar kaydedilemedi.",
    "/areas/footer",
  );
}
