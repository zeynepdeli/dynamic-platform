import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';

// Kullanılmadan 8 saat geçerse oturum kapanır; ne olursa olsun en fazla 7 gün.
export const SESSION_IDLE_MS = 8 * 60 * 60 * 1000;
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Yeni oturum aç; düz anahtar yalnızca bir kez döner */
  async create(userId: string, absoluteExpiresAt?: Date) {
    const token = randomBytes(32).toString('base64url');
    const now = Date.now();
    const absolute = absoluteExpiresAt ?? new Date(now + SESSION_ABSOLUTE_MS);
    await this.prisma.refreshSession.create({
      data: {
        userId,
        tokenHash: hash(token),
        absoluteExpiresAt: absolute,
        expiresAt: new Date(Math.min(now + SESSION_IDLE_MS, absolute.getTime())),
      },
    });
    return token;
  }

  /**
   * Anahtarı döndür (rotation): eskisi geçersiz olur, yenisi verilir.
   * Daha önce kullanılmış bir anahtar tekrar gelirse çalınmış sayılır ve
   * kullanıcının TÜM oturumları kapatılır.
   */
  async rotate(token: string) {
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: hash(token) },
      include: { user: { select: { id: true, role: true, active: true } } },
    });

    if (!session) throw new UnauthorizedException('Oturum geçersiz.');

    if (session.revokedAt) {
      this.logger.warn(`Yenileme anahtarı tekrar kullanıldı; kullanıcının tüm oturumları kapatıldı (${session.userId}).`);
      await this.revokeAll(session.userId);
      throw new UnauthorizedException('Oturum geçersiz.');
    }

    const now = new Date();
    if (session.expiresAt <= now || session.absoluteExpiresAt <= now || !session.user.active) {
      throw new UnauthorizedException('Oturumun süresi doldu.');
    }

    // Aynı anda iki istek aynı anahtarı kullanırsa yalnızca biri kazanır
    const { count } = await this.prisma.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: now },
    });
    if (count === 0) throw new UnauthorizedException('Oturum geçersiz.');

    const next = await this.create(session.userId, session.absoluteExpiresAt);
    return { user: session.user, refreshToken: next };
  }

  async revoke(token: string) {
    await this.prisma.refreshSession.updateMany({
      where: { tokenHash: hash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAll(userId: string) {
    await this.prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Süresi geçmiş kayıtları temizle (girişte çağrılır) */
  async purgeExpired() {
    const cutoff = new Date(Date.now() - SESSION_IDLE_MS);
    await this.prisma.refreshSession.deleteMany({
      where: { OR: [{ absoluteExpiresAt: { lt: new Date() } }, { expiresAt: { lt: cutoff } }] },
    });
  }
}
