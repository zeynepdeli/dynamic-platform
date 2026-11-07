import "server-only";

import { adminFetch } from "@/lib/api";
import { getIcon } from "@/components/icons/registry";
import type { SocialLink } from "@/lib/validations/social-link.schema";

type ApiSocialLink = {
  id: string;
  icon: string;
  label: string | null;
  url: string;
  order: number;
  visible: boolean;
};

export async function getAdminSocialLinks(): Promise<SocialLink[]> {
  const response = await adminFetch("/admin/social-links");
  if (!response.ok) {
    throw new Error(`Sosyal medya yüklenemedi (HTTP ${response.status}).`);
  }
  const data: unknown = await response.json();
  return (Array.isArray(data) ? (data as ApiSocialLink[]) : [])
    .filter((l) => getIcon("social", l.icon))
    .map((l) => ({
      id: l.id,
      icon: l.icon as SocialLink["icon"],
      label: l.label ?? "",
      url: l.url,
      order: l.order,
      visible: l.visible,
    }));
}
