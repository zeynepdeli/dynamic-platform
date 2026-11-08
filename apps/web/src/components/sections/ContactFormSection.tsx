import type { Section } from "@/core/types";

import { ContactForm } from "./ContactForm";
import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: İletişim formu bölümü (mesajlar → admin: Gelen Mesajlar)
export function ContactFormSection({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <div className="grid max-w-5xl gap-10 lg:grid-cols-[1fr_2fr]">
        <PlainText text={section.body} />
        <div className="relative">
          <ContactForm />
        </div>
      </div>
    </SectionShell>
  );
}
