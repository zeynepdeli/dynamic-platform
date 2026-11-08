import { moduleBySlug } from "@/brand/modules";
import { pageTemplates, type TemplateSection } from "@/brand/page-templates";
import type { Section } from "@/lib/sections";
import { SECTION_KEY_REGEX } from "@/lib/validations/section.schema";

export const HOME_TEMPLATE_KEY = "home";

export type ResolvedTemplate = {
  /** Şablonda tanımlı ama henüz oluşturulmamış bölümler */
  missing: TemplateSection[];
  /** Anahtara göre şablon bilgisi (liste içinde etiket/kilit için) */
  byKey: Record<string, TemplateSection>;
  allowExtraSections: boolean;
  hasTemplate: boolean;
};

// Geliştirme sırasında yazım hatalarını erken yakala
function assertValidTemplate(name: string, sections: TemplateSection[]) {
  const seen = new Set<string>();
  for (const section of sections) {
    if (!SECTION_KEY_REGEX.test(section.key)) {
      throw new Error(
        `brand/page-templates.ts → "${name}" şablonunda geçersiz anahtar: "${section.key}"`,
      );
    }
    if (seen.has(section.key)) {
      throw new Error(
        `brand/page-templates.ts → "${name}" şablonunda tekrar eden anahtar: "${section.key}"`,
      );
    }
    seen.add(section.key);
  }
}

export function resolveTemplate(
  templateKey: string,
  sections: Section[],
): ResolvedTemplate {
  // Önce brand şablonu, yoksa modülün (SSS, İletişim, Galeri) şablonu
  const template = Object.hasOwn(pageTemplates, templateKey)
    ? pageTemplates[templateKey]
    : moduleBySlug(templateKey)?.template;

  if (!template) {
    return {
      missing: [],
      byKey: {},
      allowExtraSections: true,
      hasTemplate: false,
    };
  }

  assertValidTemplate(templateKey, template.sections);

  const existingKeys = new Set(
    sections.map((section) => section.key).filter(Boolean),
  );

  const byKey: Record<string, TemplateSection> = {};
  for (const entry of template.sections) {
    byKey[entry.key] = { locked: true, ...entry };
  }

  return {
    missing: template.sections.filter((entry) => !existingKeys.has(entry.key)),
    byKey,
    allowExtraSections: template.allowExtraSections ?? true,
    hasTemplate: true,
  };
}
