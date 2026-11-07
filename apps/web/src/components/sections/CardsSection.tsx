import { readableTextColor, safeColor, safeImageSrc } from "@/core/safe";
import type { Section } from "@/core/types";

import { CardIcon } from "./icons";
import { SectionButton } from "./SectionButton";
import { PlainText, SectionShell } from "./SectionShell";
import { SmartLink } from "../site/SmartLink";

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

// ✏️ MÜŞTERİYE ÖZEL: Kart ızgarası tasarımı
export function CardsSection({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <PlainText text={section.body} className="mb-10 max-w-3xl" />

      <ul className={`grid gap-6 ${GRID[section.columns] ?? GRID[3]}`}>
        {section.items.map((item) => {
          const image = safeImageSrc(item.imageUrl);
          const bg = safeColor(item.backgroundColor);

          return (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
              style={bg ? { backgroundColor: bg, color: readableTextColor(bg) } : undefined}
            >
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col gap-3 p-6">
                <CardIcon name={item.icon} className="size-8 text-secondary" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                {item.description && (
                  <p className="whitespace-pre-line leading-7 opacity-80">{item.description}</p>
                )}
                {item.buttonText && (
                  <SmartLink
                    href={item.buttonHref}
                    className="mt-auto pt-2 font-semibold text-secondary hover:underline"
                  >
                    {item.buttonText} →
                  </SmartLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <SectionButton text={section.buttonText} href={section.buttonHref} />
      </div>
    </SectionShell>
  );
}
