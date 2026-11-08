import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { AuthService } from '../auth/auth.service.js';
import { SessionsService } from '../auth/sessions.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const MAX_ADMINS = 20;

// Şifre özeti ASLA dışarı çıkmaz
const PUBLIC_FIELDS = { id: true, email: true, active: true, createdAt: true } as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
  ) {}

  findAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: PUBLIC_FIELDS,
      take: MAX_ADMINS,
    });
  }

  async create(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    if ((await this.prisma.user.count({ where: { role: 'ADMIN' } })) >= MAX_ADMINS) {
      throw new BadRequestException(`En fazla ${MAX_ADMINS} yönetici eklenebilir.`);
    }
    if (await this.prisma.user.findUnique({ where: { email: normalized }, select: { id: true } })) {
      throw new ConflictException('Bu e-posta ile bir hesap zaten var.');
    }
    return this.prisma.user.create({
      data: { email: normalized, passwordHash: await this.auth.hashPassword(password), role: 'ADMIN' },
      select: PUBLIC_FIELDS,
    });
  }

  async setActive(currentUserId: string, id: string, active: boolean) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'ADMIN' }, select: { id: true, active: true } });
    if (!user) throw new NotFoundException('Yönetici bulunamadı.');

    if (!active) {
      if (id === currentUserId) throw new BadRequestException('Kendi hesabınızı pasif yapamazsınız.');
      const activeCount = await this.prisma.user.count({ where: { role: 'ADMIN', active: true } });
      if (user.active && activeCount <= 1) throw new BadRequestException('En az bir aktif yönetici kalmalı.');
    }

    const updated = await this.prisma.user.update({ where: { id }, data: { active }, select: PUBLIC_FIELDS });
    // Pasif yapılan hesabın açık oturumları hemen kapanır
    if (!active) await this.sessions.revokeAll(id);
    return updated;
  }
}
