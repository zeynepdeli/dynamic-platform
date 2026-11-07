"use client";

import { ChevronDown, ImageIcon } from "lucide-react";

import type { FooterFormValues } from "@/lib/validations/footer.schema";
import type { SectionFormValues, SectionItemFormValues } from "@/lib/validations/section.schema";

import { color, image, readable, type PreviewTheme } from "./safe";

/*
 * Admin içindeki SİTE ÖNİZLEMESİ.
 * Gerçek sitenin (apps/web) sadeleştirilmiş kopyasıdır; müşterinin özel
 * tasarımı birebir aynı görünmeyebilir ama içerik, renk ve görseller aynıdır.
 * Metinler React ile basılır (HTML çalışmaz), renk/görsel doğrulanır.
 */

export function PreviewHeader({
  theme,
  siteName,
  logoUrl,
  menu,
}: {
  theme: PreviewTheme;
  siteName: string;
  logoUrl: string;
  menu: { id: string; label: string; hasChildren: boolean }[];
}) {
  const logo = image(logoUrl, theme.mediaBaseUrl);
  return (
    <div
      className="flex items-center gap-4 px-6 py-4"
      style={{ backgroundColor: theme.primary, color: readable(theme.primary) }}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-8 w-auto max-w-36 object-contain" />
      ) : (
        <span className="truncate text-base font-semibold">{siteName || "Site Adı"}</span>
      )}
      <nav className="ml-auto hidden items-center gap-4 text-sm opacity-90 sm:flex">
        {menu.map((item) => (
          <span key={item.id} className="flex items-center gap-1">
            {item.label}
            {item.hasChildren && <ChevronDown className="size-3" />}
          </span>
        ))}
      </nav>
    </div>
  );
}

export function PreviewHero({
  theme,
  slide,
  count,
}: {
  theme: PreviewTheme;
  slide:
    | { title: string; subtitle: string | null; description: string | null; imageUrl: string | null; buttonText: string | null }
    | undefined;
  count: number;
}) {
  if (!slide) {
    return (
      <div className="flex min-h-56 items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        Henüz slider yok — eklemek için tıklayın
      </div>
    );
  }
  const bg = image(slide.imageUrl, theme.mediaBaseUrl);
  return (
    <div className="relative isolate min-h-72 overflow-hidden text-white" style={{ backgroundColor: theme.primary }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {bg && <img src={bg} alt="" className="absolute inset-0 -z-10 size-full object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/40" />
      <div className="px-8 py-16">
        {slide.subtitle && <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">{slide.subtitle}</p>}
        <p className="mt-2 max-w-xl text-3xl font-bold leading-tight">{slide.title}</p>
        {slide.description && <p className="mt-3 max-w-lg text-sm leading-6 opacity-90">{slide.description}</p>}
        {slide.buttonText && (
          <span
            className="mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: theme.secondary, color: readable(theme.secondary) }}
          >
            {slide.buttonText}
          </span>
        )}
      </div>
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PreviewPageTitle({ theme, title, content }: { theme: PreviewTheme; title: string; content: string }) {
  return (
    <>
      <div className="px-8 py-12" style={{ backgroundColor: theme.primary, color: readable(theme.primary) }}>
        <p className="text-3xl font-bold">{title || "Sayfa Başlığı"}</p>
      </div>
      {content && (
        <p className="mx-auto max-w-2xl whitespace-pre-line px-8 py-8 text-sm leading-7 text-neutral-700">{content}</p>
      )}
    </>
  );
}

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export function PreviewSection({
  theme,
  values,
  items,
  index,
}: {
  theme: PreviewTheme;
  values: SectionFormValues;
  items: (SectionItemFormValues & { id: string })[];
  index: number;
}) {
  const bg = color(values.backgroundColor);
  const img = image(values.backgroundImage, theme.mediaBaseUrl);
  const isImageText = values.type === "IMAGE_TEXT";
  const isCta = values.type === "CTA";
  const ctaBg = isCta && !bg && !img ? theme.primary : bg;
  const bgImage = isImageText ? undefined : img;
  const textColor = color(values.textColor) ?? (bgImage ? "#ffffff" : readable(ctaBg) ?? "#111827");

  const heading = (
    <>
      {values.subtitle && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">{values.subtitle}</p>}
      {values.title && <p className="mt-1 text-2xl font-bold tracking-tight">{values.title}</p>}
    </>
  );
  const button = values.buttonText && (
    <span
      className="inline-flex w-fit rounded-lg px-4 py-2 text-sm font-semibold"
      style={{ backgroundColor: theme.secondary, color: readable(theme.secondary) }}
    >
      {values.buttonText}
    </span>
  );

  return (
    <div
      className={`relative isolate overflow-hidden px-8 py-12 ${isCta ? "text-center" : ""}`}
      style={{ backgroundColor: ctaBg, color: textColor }}
    >
      {bgImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgImage} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-black/50" />
        </>
      )}

      {isImageText ? (
        <div className={`grid items-center gap-8 md:grid-cols-2 ${index % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-black/5">
              <ImageIcon className="size-6 opacity-40" />
            </div>
          )}
          <div className="space-y-4">
            {heading}
            {values.body && <p className="whitespace-pre-line text-sm leading-7 opacity-90">{values.body}</p>}
            {button}
          </div>
        </div>
      ) : (
        <div className={`space-y-4 ${isCta ? "mx-auto flex max-w-xl flex-col items-center" : ""}`}>
          {heading}
          {values.body && <p className="max-w-2xl whitespace-pre-line text-sm leading-7 opacity-90">{values.body}</p>}

          {values.type === "CARDS" && (
            <div className={`grid gap-4 pt-2 ${GRID[values.columns] ?? GRID[3]}`}>
              {items.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-current/20 p-6 text-center text-xs opacity-60">
                  Henüz kart yok
                </div>
              )}
              {items.map((item) => {
                const cardBg = color(item.backgroundColor);
                const cardImg = image(item.imageUrl, theme.mediaBaseUrl);
                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-xl bg-white text-neutral-900 shadow-sm ring-1 ring-black/5 ${item.active ? "" : "opacity-40"}`}
                    style={cardBg ? { backgroundColor: cardBg, color: readable(cardBg) } : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {cardImg && <img src={cardImg} alt="" className="aspect-[4/3] w-full object-cover" />}
                    <div className="space-y-1 p-4">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.description && <p className="line-clamp-3 text-xs leading-5 opacity-75">{item.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {button && <div className="pt-2">{button}</div>}
        </div>
      )}
    </div>
  );
}

export function PreviewFooter({ theme, siteName, values }: { theme: PreviewTheme; siteName: string; values: FooterFormValues }) {
  if (!values.enabled) {
    return (
      <div className="bg-neutral-100 px-8 py-6 text-center text-xs text-neutral-500">
        Footer kapalı — sitede gösterilmiyor
      </div>
    );
  }
  return (
    <div style={{ backgroundColor: theme.primary, color: readable(theme.primary) }}>
      <div className="grid gap-6 px-8 py-10 text-sm md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-semibold">{siteName}</p>
          {values.description && <p className="text-xs leading-5 opacity-80">{values.description}</p>}
        </div>
        <div className="space-y-1 text-xs opacity-90">
          {values.email && <p>{values.email}</p>}
          {values.phone && <p>{values.phone}</p>}
          {values.address && <p className="whitespace-pre-line">{values.address}</p>}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {(
            [
              ["instagramUrl", "Instagram"],
              ["facebookUrl", "Facebook"],
              ["linkedinUrl", "LinkedIn"],
              ["youtubeUrl", "YouTube"],
              ["githubUrl", "GitHub"],
            ] as const
          )
            .filter(([key]) => values[key])
            .map(([key, label]) => (
              <span key={key} className="h-fit rounded-md border border-current/20 px-2 py-1 text-xs">
                {label}
              </span>
            ))}
        </div>
      </div>
      {values.copyright && <p className="border-t border-current/10 py-3 text-center text-[11px] opacity-70">{values.copyright}</p>}
    </div>
  );
}
