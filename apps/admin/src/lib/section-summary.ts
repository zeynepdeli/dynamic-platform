import { ITEM_CONFIG, hasItems } from "@/lib/section-types";
import type { Section } from "@/lib/sections";

/** Bölümün kısa özeti: kartlı bölümlerde sayı ("4 kart · 1 gizli"), diğerlerinde metnin başı */
export function sectionSummary(section: Section): string {
  if (hasItems(section.type)) {
    const label = (ITEM_CONFIG[section.type]?.label ?? "Öğe").toLocaleLowerCase("tr-TR");
    const active = section.items.filter((i) => i.active).length;
    const hidden = section.items.length - active;
    return `${active} ${label}${hidden ? ` · ${hidden} gizli` : ""}`;
  }
  return (section.subtitle || section.body || "").replace(/\s+/g, " ").slice(0, 110);
}
