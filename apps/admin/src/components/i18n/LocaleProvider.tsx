"use client";

import { createContext, useContext } from "react";

import type { Locale, LocaleConfig } from "@/lib/i18n";

const LocaleContext = createContext<LocaleConfig>({
  defaultLocale: "tr",
  locales: ["tr"],
});

/** Sitenin dil ayarı: formlar çeviri sekmesini yalnızca ek dil açıksa gösterir */
export function LocaleProvider({
  value,
  children,
}: {
  value: LocaleConfig;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export const useLocaleConfig = () => useContext(LocaleContext);

/** Ana dil dışındaki açık diller */
export function useExtraLocales(): Locale[] {
  const { defaultLocale, locales } = useLocaleConfig();
  return locales.filter((l) => l !== defaultLocale);
}
