import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  type Locale,
  type LocaleConfig,
  normalizeLocaleConfig,
  resolveLocale,
} from './locales.js';
import { slugFor } from './localize.js';

export type LocaleContext = {
  locale: Locale;
  slugMap: ReadonlyMap<string, string>;
} & LocaleConfig;

@Injectable()
export class I18nService {
  constructor(private readonly prisma: PrismaService) {}

  /** Sitenin dil ayarı (kayıt yoksa yalnızca Türkçe) */
  async config(): Promise<LocaleConfig> {
    const s = await this.prisma.siteSettings.findUnique({
      where: { id: 'main' },
      select: { defaultLocale: true, locales: true },
    });
    return normalizeLocaleConfig(s?.defaultLocale, s?.locales);
  }

  /** ?lang= → kullanılacak dil ve ana dil */
  async resolve(
    requested: unknown,
  ): Promise<{ locale: Locale } & LocaleConfig> {
    const config = await this.config();
    return { ...config, locale: resolveLocale(requested, config) };
  }

  /**
   * Dil + bağlantı çevirisi için sayfa adresleri (ana dildeki slug → o dildeki slug).
   * Ana dilde eşleme gerekmez; boş döner.
   */
  async context(requested: unknown): Promise<LocaleContext> {
    const resolved = await this.resolve(requested);
    if (resolved.locale === resolved.defaultLocale)
      return { ...resolved, slugMap: new Map() };
    const pages = await this.prisma.page.findMany({
      where: { deletedAt: null },
      select: { slug: true, translations: true },
    });
    return {
      ...resolved,
      slugMap: new Map(
        pages.map((p) => [
          p.slug,
          slugFor(p, resolved.locale, resolved.defaultLocale),
        ]),
      ),
    };
  }
}

/** Dil bilgisi verilmeyen (iç) çağrılar için: yalnızca Türkçe */
export const DEFAULT_LOCALE_CONTEXT: LocaleContext = {
  locale: 'tr',
  defaultLocale: 'tr',
  locales: ['tr'],
  slugMap: new Map(),
};
