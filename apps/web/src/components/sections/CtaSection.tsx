import type { Section } from "@/core/types";

import { SectionButton } from "./SectionButton";
import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: Çağrı (CTA) bölümü
export function CtaSection({ section }: { section: Section }) {
  // Renk/görsel seçilmemişse ana tema rengini kullan
  return (
    <div className={section.backgroundColor || section.backgroundImage ? "" : "bg-primary text-on-primary"}>
      <SectionShell section={section} className="text-center [&_header]:mx-auto">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
          <PlainText text={section.body} />
          <SectionButton text={section.buttonText} href={section.buttonHref} />
        </div>
      </SectionShell>
    </div>
  );
}
