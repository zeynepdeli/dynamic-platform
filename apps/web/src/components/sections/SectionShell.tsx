import { readableTextColor, safeColor, safeImageSrc } from "@/core/safe";
import type { Section } from "@/core/types";

/**
 * Her bölümün ortak kabuğu: arka plan rengi / görseli, yazı rengi,
 * başlık ve alt başlık. Renkler doğrulanmadan style'a yazılmaz;
 * arka plan görseli CSS url() yerine <img> ile verilir (CSS injection yok).
 */
export function SectionShell({
  section,
  children,
  showBackgroundImage = true,
  className = "",
}: {
  section: Section;
  children: React.ReactNode;
  showBackgroundImage?: boolean;
  className?: string;
}) {
  const background = safeColor(section.backgroundColor);
  const image = showBackgroundImage ? safeImageSrc(section.backgroundImage) : undefined;
  const color =
    safeColor(section.textColor) ??
    (image ? "#ffffff" : readableTextColor(background));

  return (
    <section
      id={section.key ?? undefined}
      className={`relative isolate overflow-hidden py-16 sm:py-24 ${className}`}
      style={{ backgroundColor: background, color }}
    >
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />
        </>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(section.subtitle || section.title) && (
          <header className="mb-10 max-w-3xl">
            {section.subtitle && (
              <p className="text-sm font-semibold uppercase tracking-widest opacity-75">
                {section.subtitle}
              </p>
            )}
            {section.title && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {section.title}
              </h2>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

/** Admin'deki düz metin: paragrafları korur, HTML çalıştırmaz */
export function PlainText({ text, className = "" }: { text: string | null; className?: string }) {
  if (!text) return null;
  return <p className={`whitespace-pre-line text-lg leading-8 opacity-90 ${className}`}>{text}</p>;
}
