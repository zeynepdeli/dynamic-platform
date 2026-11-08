import { safeImageSrc } from "@/core/safe";
import { altFor } from "@/core/site";
import type { Section } from "@/core/types";

import { SectionButton } from "./SectionButton";
import { PlainText, SectionShell } from "./SectionShell";

// ✏️ MÜŞTERİYE ÖZEL: Görsel + metin bölümü.
// Bu tipte "arka plan görseli" alanı yandaki görsel olarak kullanılır.
export async function ImageTextSection({
  section,
  reverse = false,
}: {
  section: Section;
  reverse?: boolean;
}) {
  const image = safeImageSrc(section.backgroundImage);
  const alt = await altFor(section.backgroundImage);

  return (
    <SectionShell section={section} showBackgroundImage={false}>
      <div className={`grid items-center gap-10 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={alt} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm" />
        ) : (
          <div className="aspect-[4/3] w-full rounded-2xl bg-black/5" aria-hidden="true" />
        )}
        <div className="space-y-8">
          <PlainText text={section.body} />
          <SectionButton text={section.buttonText} href={section.buttonHref} />
        </div>
      </div>
    </SectionShell>
  );
}
