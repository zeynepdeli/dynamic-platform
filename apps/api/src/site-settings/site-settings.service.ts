import { Injectable } from '@nestjs/common';
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
    return this.prisma.siteSettings.upsert({
      where: {
        id: 'main',
      },
      update: data,
      create: {
        ...data,
        id: 'main',
        siteName: data.siteName ?? 'Yeni Web Sitesi',
      },
    });
  }
}
