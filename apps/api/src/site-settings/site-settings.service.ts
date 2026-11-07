import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateSiteSettingsDto } from './dto/update-site-settings.dto.js';

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

    return this.prisma.siteSettings.update({
      where: { id: 'main' },
      data,
    });
  }
}
