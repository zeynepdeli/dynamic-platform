import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { assertSameIds } from '../common/reorder.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type {
  CreateSocialLinkDto,
  UpdateSocialLinkDto,
} from './dto/social-link.dto.js';

// Kaynak tüketimini sınırla (OWASP A04)
export const MAX_SOCIAL_LINKS = 20;

const ORDER = [
  { order: 'asc' as const },
  { createdAt: 'asc' as const },
  { id: 'asc' as const },
];

const emptyToNull = (v: string | null | undefined) =>
  v === undefined ? undefined : v?.trim() ? v.trim() : null;

@Injectable()
export class SocialLinksService {
  constructor(private readonly prisma: PrismaService) {}

  // Ziyaretçiye: yalnızca görünür olanlar, gerekli alanlar
  findPublic() {
    return this.prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: ORDER,
      select: { id: true, icon: true, label: true, url: true },
    });
  }

  findAll() {
    return this.prisma.socialLink.findMany({ orderBy: ORDER });
  }

  async create(dto: CreateSocialLinkDto) {
    const count = await this.prisma.socialLink.count();
    if (count >= MAX_SOCIAL_LINKS) {
      throw new BadRequestException(
        `En fazla ${MAX_SOCIAL_LINKS} sosyal medya bağlantısı eklenebilir.`,
      );
    }

    return this.prisma.socialLink.create({
      data: {
        icon: dto.icon,
        label: emptyToNull(dto.label) ?? null,
        url: dto.url,
        visible: dto.visible ?? true,
        order: count, // en sona
      },
    });
  }

  async update(id: string, dto: UpdateSocialLinkDto) {
    await this.ensureExists(id);
    return this.prisma.socialLink.update({
      where: { id },
      data: {
        icon: dto.icon,
        label: emptyToNull(dto.label),
        url: dto.url,
        visible: dto.visible,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.socialLink.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const links = await this.prisma.socialLink.findMany({
      select: { id: true },
    });
    assertSameIds(
      links.map((l) => l.id),
      ids,
    );
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.socialLink.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
    return this.findAll();
  }

  private async ensureExists(id: string) {
    const link = await this.prisma.socialLink.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!link) throw new NotFoundException('Bağlantı bulunamadı.');
  }
}
