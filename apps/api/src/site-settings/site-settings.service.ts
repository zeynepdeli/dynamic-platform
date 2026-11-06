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
    const current = await this.getSettings();

    // Güncelleme sonrası oluşacak durumu kontrol et
    const nextType = data.backgroundType ?? current.backgroundType;
    const nextImage =
      data.backgroundImage !== undefined
        ? data.backgroundImage
        : current.backgroundImage;

    if (nextType === 'IMAGE' && !nextImage) {
      throw new BadRequestException(
        'Görsel arka plan seçildiğinde arka plan görseli zorunludur.',
      );
    }

    return this.prisma.siteSettings.update({
      where: { id: 'main' },
      data,
    });
  }
}
