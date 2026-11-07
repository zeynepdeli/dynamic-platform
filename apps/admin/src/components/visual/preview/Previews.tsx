"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import type { FooterFormValues } from "@/lib/validations/footer.schema";
import type { SocialLink } from "@/lib/validations/social-link.schema";
import { getIcon } from "@/components/icons/registry";
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
  menu: { id: string; label: string; icon?: string | null; hasChildren: boolean }[];
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
        {menu.map((item) => {
          const MenuIcon = getIcon("menu", item.icon)?.Icon;
          return (
          <span key={item.id} className="flex items-center gap-1.5">
            {MenuIcon && <MenuIcon className="size-3.5" />}
            {item.label}
            {item.hasChildren && <ChevronDown className="size-3" />}
          </span>
          );
        })}
      </nav>
    </div>
  );
}

type HeroPreviewSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  active: boolean;
};

/** Çalışan slider önizlemesi: oklar ve noktalarla slaytlar arasında gezinilir */
export function PreviewHero({
  theme,
  slides,
  index,
  onIndexChange,
}: {
  theme: PreviewTheme;
  slides: HeroPreviewSlide[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  if (slides.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        Henüz slayt yok — eklemek için tıklayın
      </div>
    );
  }

  const current = slides[Math.min(index, slides.length - 1)];
  const bg = image(current.imageUrl, theme.mediaBaseUrl);
  const go = (next: number) => onIndexChange((next + slides.length) % slides.length);

  return (
    <div className="relative isolate min-h-80 overflow-hidden text-white" style={{ backgroundColor: theme.primary }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {bg && <img src={bg} alt="" className="absolute inset-0 -z-10 size-full object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/40" />

      {!current.active && (
        <span className="absolute right-3 top-14 z-10 rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-semibold text-amber-950">
          Gizli — sitede görünmez
        </span>
      )}

      <div className="px-10 py-16">
        {current.subtitle && <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">{current.subtitle}</p>}
        <p className="mt-2 max-w-xl text-3xl font-bold leading-tight">{current.title || "Başlık"}</p>
        {current.description && <p className="mt-3 max-w-lg text-sm leading-6 opacity-90">{current.description}</p>}
        {current.buttonText && (
          <span
            className="mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: theme.secondary, color: readable(theme.secondary) }}
          >
            {current.buttonText}
          </span>
        )}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          <button type="button" aria-label="Önceki slayt" onClick={() => go(index - 1)} className="rounded-full bg-black/30 p-1.5 hover:bg-black/50">
            <ChevronLeft className="size-4" />
          </button>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`${i + 1}. slayt`}
              aria-current={i === index}
              onClick={() => onIndexChange(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
          <button type="button" aria-label="Sonraki slayt" onClick={() => go(index + 1)} className="rounded-full bg-black/30 p-1.5 hover:bg-black/50">
            <ChevronRight className="size-4" />
          </button>
          <span className="ml-1 rounded bg-black/30 px-1.5 py-0.5 text-[11px]">
            {index + 1}/{slides.length}
          </span>
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

export function PreviewFooter({
  theme,
  siteName,
  values,
  socialLinks,
}: {
  theme: PreviewTheme;
  siteName: string;
  values: FooterFormValues;
  socialLinks: SocialLink[];
}) {
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
          {socialLinks
            .filter((link) => link.visible)
            .map((link) => {
              const entry = getIcon("social", link.icon);
              if (!entry) return null;
              return (
                <span
                  key={link.id}
                  title={link.label || entry.label}
                  className="flex size-8 items-center justify-center rounded-full border border-current/25"
                >
                  <entry.Icon className="size-4" />
                </span>
              );
            })}
        </div>
      </div>
      {values.copyright && <p className="border-t border-current/10 py-3 text-center text-[11px] opacity-70">{values.copyright}</p>}
    </div>
  );
}
