import type { Section } from "@/core/types";

import { CardIcon } from "./icons";
import { PlainText, SectionShell } from "./SectionShell";

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

// ✏️ MÜŞTERİYE ÖZEL: Sayılar ("500+ mutlu müşteri")
export function StatsSection({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <PlainText text={section.body} className="mb-10 max-w-3xl" />
      <dl className={`grid gap-8 text-center ${GRID[section.columns] ?? GRID[4]}`}>
        {section.items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <CardIcon name={item.icon} className="size-8 text-secondary" />
            <dt className="order-2 opacity-75">{item.description}</dt>
            <dd className="order-1 text-4xl font-bold tracking-tight text-secondary sm:text-5xl">{item.title}</dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}
