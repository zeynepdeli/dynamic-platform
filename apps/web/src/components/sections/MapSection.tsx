import { MapPin, Navigation } from "lucide-react";

import { mapLinks } from "@/core/embed";
import type { Section } from "@/core/types";

import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: Adres + harita
export function MapSection({ section }: { section: Section }) {
  const links = mapLinks(section.mapAddress);
  if (!links) return null;
  return (
    <SectionShell section={section}>
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <p className="flex items-start gap-2 text-lg font-medium">
            <MapPin className="mt-1 size-5 shrink-0 text-secondary" aria-hidden="true" />
            {section.mapAddress}
          </p>
          <PlainText text={section.body} />
          <a
            href={links.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary hover:opacity-90"
          >
            <Navigation className="size-4" aria-hidden="true" />
            Yol tarifi al
          </a>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 lg:aspect-[16/9]">
          <iframe
            src={links.embed}
            title={`Harita: ${section.mapAddress}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0"
          />
        </div>
      </div>
    </SectionShell>
  );
}
