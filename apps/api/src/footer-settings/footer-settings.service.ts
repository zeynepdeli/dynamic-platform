import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { UpdateFooterSettingsDto } from './dto/update-footer-settings.dto.js';
import { localize, mergeTranslations, TRANSLATABLE } from '../i18n/localize.js';
import { DEFAULT_LOCALE_CONTEXT, type LocaleContext } from '../i18n/i18n.service.js';

@Injectable()
export class FooterSettingsService {
  private readonly settingsId = 'main';

  constructor(private readonly prisma: PrismaService) {}

  // Footer ayarlarını getir.
  // Kayıt yoksa varsayılan ayarları oluştur.
  async findPublic() {
    return this.prisma.footerSettings.upsert({
      where: {
        id: this.settingsId,
      },
      create: {
        id: this.settingsId,
      },
      update: {},
    });
  }

  // Admin panelinde mevcut ayarları getir.
  async findAdmin() {
    return this.findPublic();
  }

  // Footer ayarlarını güncelle.
  async update(dto: UpdateFooterSettingsDto) {
    const current = await this.findAdmin();
    const { translations, ...rest } = dto;
    return this.prisma.footerSettings.update({
      where: { id: this.settingsId },
      data: { ...rest, translations: mergeTranslations(current.translations, translations) },
    });
  }

  /** Ziyaretçiye: istenen dile çevrilmiş footer */
  async findLocalized(ctx: LocaleContext = DEFAULT_LOCALE_CONTEXT) {
    const { id: _id, createdAt: _c, updatedAt: _u, ...footer } = await this.findPublic();
    return localize(footer, ctx.locale, ctx.defaultLocale, TRANSLATABLE.footer);
  }
}
