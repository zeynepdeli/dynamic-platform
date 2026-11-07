import type { Section, SectionItem } from "@/lib/sections";
import type { SectionFormValues, SectionItemFormValues } from "@/lib/validations/section.schema";

/** Sunucuda form değerleri hazırlanmış bölüm (istemci bileşenlerine verilir) */
export type SectionListEntry = Omit<Section, "items"> & {
  formValues: SectionFormValues;
  items: (SectionItem & { formValues: SectionItemFormValues })[];
};
