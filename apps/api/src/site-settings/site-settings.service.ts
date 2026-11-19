import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateSiteSettingsDto } from './dto/update-site-settings.dto.js';
import { DEFAULT_LOCALE_CONTEXT, type LocaleContext } from '../i18n/i18n.service.js';
import { normalizeLocaleConfig } from '../i18n/locales.js';
import { localize, localizeHref, mergeTranslations, TRANSLATABLE } from '../i18n/localize.js';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Site ayarlarını getir
  async getSettings() {
    return this.prisma.siteSettings.upsert({
      where: {
        id: 'main',
      },
      update: {},
      create: {
        id: 'main',
        siteName: 'Yeni Web Sitesi',
      },
    });
  }

  // ADMIN: Site ayarlarını güncelle
  async updateSettings(data: UpdateSiteSettingsDto) {
    // Kayıt yoksa oluştur
    await this.getSettings();

    // Buton: metin ve bağlantı birlikte olmalı
    if (
      data.headerButtonText !== undefined ||
      data.headerButtonHref !== undefined
    ) {
      const current = await this.getSettings();
      const text = data.headerButtonText !== undefined ? data.headerButtonText : current.headerButtonText;
      const href = data.headerButtonHref !== undefined ? data.headerButtonHref : current.headerButtonHref;
      if (!!text?.trim() !== !!href) {
        throw new BadRequestException(
          'Header butonu için metin ve bağlantı birlikte girilmeli.',
        );
      }
    }

    const current = await this.getSettings();
    const { translations, defaultLocale, locales, ...rest } = data;
    // Diller: ana dil her zaman açık; normalize edilir (src/i18n/locales.ts)
    const localeConfig =
      defaultLocale !== undefined || locales !== undefined
        ? normalizeLocaleConfig(defaultLocale ?? current.defaultLocale, locales ?? current.locales)
        : undefined;
    return this.prisma.siteSettings.update({
      where: { id: 'main' },
      data: {
        ...rest,
        ...(localeConfig ? { defaultLocale: localeConfig.defaultLocale, locales: localeConfig.locales } : {}),
        translations: mergeTranslations(current.translations, translations),
      },
    });
  }

  /**
   * Ziyaretçiye dönen ayarlar: iç alanlar (bildirim e-postası) çıkarılır, metinler istenen dilde.
   */
  async getPublicSettings(ctx: LocaleContext = DEFAULT_LOCALE_CONTEXT) {
    const { notifyEmail: _notify, createdAt: _c, ...settings } = await this.getSettings();
    const config = normalizeLocaleConfig(settings.defaultLocale, settings.locales);
    const localized = localize(settings, ctx.locale, ctx.defaultLocale, TRANSLATABLE.siteSettings);
    return {
      ...localized,
      headerButtonHref: localizeHref(localized.headerButtonHref, ctx.locale, ctx.defaultLocale, ctx.slugMap),
      defaultLocale: config.defaultLocale,
      locales: config.locales,
      locale: ctx.locale,
    };
  }
}
