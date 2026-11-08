import { altFor } from "@/core/site";
import { safeImageSrc } from "@/core/safe";
import type { Section } from "@/core/types";

import { PlainText, SectionShell } from "./SectionShell";

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

// ✏️ MÜŞTERİYE ÖZEL: Galeri
export async function GallerySection({ section }: { section: Section }) {
  const images = await Promise.all(
    section.items.map(async (item) => ({
      id: item.id,
      src: safeImageSrc(item.imageUrl),
      caption: item.title,
      alt: (await altFor(item.imageUrl)) || item.title,
    })),
  );

  return (
    <SectionShell section={section}>
      <PlainText text={section.body} className="mb-8 max-w-3xl" />
      <ul className={`grid gap-4 ${GRID[section.columns] ?? GRID[3]}`}>
        {images
          .filter((img) => img.src)
          .map((img) => (
            <li key={img.id}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
                {img.caption && <figcaption className="mt-2 text-sm opacity-75">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
      </ul>
    </SectionShell>
  );
}
