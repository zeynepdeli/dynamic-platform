import type { Section, SectionType } from "@/core/types";

import { CardsSection } from "./CardsSection";
import { CtaSection } from "./CtaSection";
import { ImageTextSection } from "./ImageTextSection";
import { TextSection } from "./TextSection";

/**
 * Bölüm tipini doğru bileşene yönlendirir. Bilinmeyen tip → hiçbir şey.
 * Özel tasarımlı sayfalarda bunun yerine bölümleri anahtarıyla alıp
 * (page.section("vizyon")) kendi bileşenlerinize verebilirsiniz.
 */
const RENDERERS: Record<SectionType, (props: { section: Section; index: number }) => React.ReactNode> = {
  CARDS: ({ section }) => <CardsSection section={section} />,
  TEXT: ({ section }) => <TextSection section={section} />,
  // Ardışık görsel+metin bölümleri sağ-sol dönüşümlü
  IMAGE_TEXT: ({ section, index }) => <ImageTextSection section={section} reverse={index % 2 === 1} />,
  CTA: ({ section }) => <CtaSection section={section} />,
};

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const Render = Object.hasOwn(RENDERERS, section.type) ? RENDERERS[section.type] : undefined;
        return Render ? <Render key={section.id} section={section} index={index} /> : null;
      })}
    </>
  );
}
