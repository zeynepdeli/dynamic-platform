import type { Section } from "@/core/types";

import { SectionButton } from "./SectionButton";
import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: Metin bölümü tasarımı
export function TextSection({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <div className="max-w-3xl space-y-8">
        <PlainText text={section.body} />
        <SectionButton text={section.buttonText} href={section.buttonHref} />
      </div>
    </SectionShell>
  );
}
