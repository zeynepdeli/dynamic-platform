import { ChevronDown } from "lucide-react";

import type { Section } from "@/core/types";

import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: Sıkça sorulan sorular (JavaScript gerektirmez: <details>)
export function FaqSection({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <PlainText text={section.body} className="mb-8 max-w-3xl" />
      <div className="max-w-3xl divide-y divide-current/10 rounded-2xl border border-current/10 bg-white/70 text-gray-900">
        {section.items.map((item, i) => (
          <details key={item.id} className="group p-5" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {item.title}
              <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            {item.description && <p className="mt-3 whitespace-pre-line leading-7 opacity-80">{item.description}</p>}
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
