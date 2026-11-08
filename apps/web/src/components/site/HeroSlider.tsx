"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/** Sunucuda doğrulanmış slider verisi (bkz. app/page.tsx) */
export type HeroSlideView = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | undefined;
  mobileImage: string | undefined;
  alt: string;
  button: { text: string; href: string } | null;
};

const INTERVAL_MS = 6000;

// ✏️ MÜŞTERİYE ÖZEL: Slider tasarımı
export function HeroSlider({ slides }: { slides: HeroSlideView[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => go(index + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [index, paused, count, go]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
      className="relative isolate overflow-hidden bg-primary text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} / ${count}`}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"} ${i === 0 ? "relative" : ""}`}
        >
          {slide.image && (
            <picture>
              {slide.mobileImage && (
                <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
              )}
              { }
              <img
                src={slide.image}
                alt={slide.alt}
                fetchPriority={i === 0 ? "high" : "auto"}
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 -z-10 size-full object-cover"
              />
            </picture>
          )}
          <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden="true" />

          <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
            {slide.subtitle && (
              <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
                {slide.subtitle}
              </p>
            )}
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              {slide.title}
            </h1>
            {slide.description && (
              <p className="mt-5 max-w-2xl text-lg leading-8 opacity-90">
                {slide.description}
              </p>
            )}
            {slide.button && (
              <Link
                href={slide.button.href}
                tabIndex={i === index ? 0 : -1}
                className="mt-8 inline-flex w-fit rounded-xl bg-secondary px-6 py-3 font-semibold text-on-secondary shadow-sm transition hover:opacity-90"
              >
                {slide.button.text}
              </Link>
            )}
          </div>
        </div>
      ))}

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <button type="button" aria-label="Önceki" onClick={() => go(index - 1)} className="rounded-full bg-black/30 p-2 hover:bg-black/50">
            <ChevronLeft className="size-4" />
          </button>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`${i + 1}. slayta git`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
          <button type="button" aria-label="Sonraki" onClick={() => go(index + 1)} className="rounded-full bg-black/30 p-2 hover:bg-black/50">
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            aria-label={paused ? "Oynat" : "Duraklat"}
            onClick={() => setPaused((p) => !p)}
            className="ml-2 rounded-full bg-black/30 p-2 hover:bg-black/50"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        </div>
      )}
    </section>
  );
}
