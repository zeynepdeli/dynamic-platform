import type { CSSProperties } from "react";

import { readableTextColor, safeColor } from "./safe";
import type { SiteSettings } from "./types";

/**
 * Admin'deki renkleri CSS değişkenlerine çevirir. <body style={...}>
 * üzerine yazılır; bileşenlerde sabit renk yerine şunları kullanın:
 *
 *   bg-primary  text-primary  bg-secondary  text-on-primary  ...
 *   (globals.css içindeki @theme eşlemeleri)
 *
 * Değerler #RRGGBB olarak doğrulanır; geçersizse varsayılana düşer.
 * Bu yüzden CSS'e kullanıcı girdisi ham olarak yazılmaz.
 */
export function themeStyle(settings: SiteSettings): CSSProperties {
  const primary = safeColor(settings.primaryColor) ?? "#183350";
  const secondary = safeColor(settings.secondaryColor) ?? "#346872";
  const background = safeColor(settings.backgroundColor) ?? "#ffffff";

  return {
    "--site-primary": primary,
    "--site-secondary": secondary,
    "--site-background": background,
    "--site-on-primary": readableTextColor(primary),
    "--site-on-secondary": readableTextColor(secondary),
    "--site-foreground": readableTextColor(background),
  } as CSSProperties;
}
