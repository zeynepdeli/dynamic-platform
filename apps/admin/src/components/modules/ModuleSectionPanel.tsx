"use client";

import { useRouter } from "next/navigation";

import type { TemplateSection } from "@/brand/page-templates";
import { InlineItems } from "@/components/outline/InlineItems";
import { SectionForm } from "@/components/sections/SectionForm";
import { updateSectionAction } from "@/app/actions/sections";
import { ITEM_CONFIG, hasItems } from "@/lib/section-types";
import type { SectionItem } from "@/lib/sections";
import type {
  SectionFormValues,
  SectionItemFormValues,
  SectionType,
} from "@/lib/validations/section.schema";

export type ModuleSection = {
  id: string;
  type: SectionType;
  formValues: SectionFormValues;
  items: (SectionItem & { formValues: SectionItemFormValues })[];
};

/** Modül ekranında bir bölüm: ayarları + (varsa) öğe listesi */
export function ModuleSectionPanel({
  section,
  entry,
  mediaBaseUrl,
  part,
}: {
  section: ModuleSection;
  entry: TemplateSection;
  mediaBaseUrl: string;
  /** "settings": bölüm ayarları · "items": öğe listesi */
  part: "settings" | "items";
}) {
  const router = useRouter();

  if (part === "items") {
    if (!hasItems(section.type)) return null;
    return (
      <InlineItems
        sectionId={section.id}
        sectionType={section.type}
        items={section.items}
        mediaBaseUrl={mediaBaseUrl}
        itemLabel={entry.itemLabel ?? ITEM_CONFIG[section.type]?.label ?? "Öğe"}
        fields={entry.itemFields ?? ITEM_CONFIG[section.type]?.fields}
      />
    );
  }

  return (
    <SectionForm
      mode="edit"
      lock={{ label: entry.label }}
      fields={entry.fields}
      initialValues={section.formValues}
      mediaBaseUrl={mediaBaseUrl}
      onSubmit={async (values) => {
        const result = await updateSectionAction(section.id, values);
        if (!result.success) return result.error;
        router.refresh();
        return null;
      }}
    />
  );
}
