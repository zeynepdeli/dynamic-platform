"use client";

import { HEX_COLOR_REGEX, imageUrlSchema } from "@/lib/validations/common";
import type { AppearanceFormValues } from "@/lib/validations/appearance.schema";

type AppearancePreviewProps = {
  values: AppearanceFormValues;
  mediaBaseUrl: string;
};

// Yalnızca doğrulamadan geçen renkler stile yazılır
function safeColor(value: string, fallback: string) {
  return HEX_COLOR_REGEX.test(value) ? value : fallback;
}

// Yalnızca doğrulamadan geçen görsel adresleri kullanılır.
// /media/... yolları API adresiyle tamamlanır.
function safeImage(value: string, mediaBaseUrl: string): string | null {
  if (!value || !imageUrlSchema.safeParse(value).success) {
    return null;
  }

  return value.startsWith("/media/") ? `${mediaBaseUrl}${value}` : value;
}

export function AppearancePreview({
  values,
  mediaBaseUrl,
}: AppearancePreviewProps) {
  const primary = safeColor(values.primaryColor, "#183350");
  const secondary = safeColor(values.secondaryColor, "#346872");
  const background = safeColor(values.backgroundColor, "#ffffff");
  const logo = safeImage(values.logoUrl, mediaBaseUrl);
  const backgroundImage =
    values.backgroundType === "IMAGE"
      ? safeImage(values.backgroundImage, mediaBaseUrl)
      : null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{ backgroundColor: background }}
      aria-label="Tema önizlemesi"
    >
      {/*
        Arka plan görseli CSS url(...) yerine <img> ile gösterilir:
        kullanıcı girdisi CSS'e yazılmadığı için CSS injection riski yoktur.
      */}
      {backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImage}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
        />
      )}

      <div className="relative">
        <div
          className="flex items-center gap-3 px-5 py-4 text-white"
          style={{ backgroundColor: primary }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              referrerPolicy="no-referrer"
              className="h-8 w-auto max-w-28 object-contain"
            />
          ) : (
            <div className="size-8 rounded-lg bg-white/20" />
          )}
          <span className="truncate font-semibold">
            {values.siteName || "Site Adı"}
          </span>
          <span className="ml-auto hidden gap-4 text-sm opacity-80 sm:flex">
            <span>Ana Sayfa</span>
            <span>Hakkımızda</span>
          </span>
        </div>

        <div className="space-y-4 p-6">
          <div className="max-w-sm rounded-xl bg-white/90 p-5 shadow-sm backdrop-blur">
            <p className="text-lg font-semibold" style={{ color: primary }}>
              Örnek Başlık
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {values.description || "Site açıklaması burada görünecek."}
            </p>
            <button
              type="button"
              tabIndex={-1}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: secondary }}
            >
              Örnek Buton
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
