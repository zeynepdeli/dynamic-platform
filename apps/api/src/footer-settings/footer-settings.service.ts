import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { UpdateFooterSettingsDto } from './dto/update-footer-settings.dto.js';

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
    return this.prisma.footerSettings.upsert({
      where: {
        id: this.settingsId,
      },
      create: {
        id: this.settingsId,
        ...dto,
      },
      update: {
        ...dto,
      },
    });
  }
}
