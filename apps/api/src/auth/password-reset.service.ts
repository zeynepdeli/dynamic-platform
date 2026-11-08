import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';

import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { SessionsService } from './sessions.service.js';

export const RESET_TTL_MS = 30 * 60 * 1000;
const hash = (t: string) => createHash('sha256').update(t).digest('hex');
const GENERIC = { success: true, message: 'Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.' };

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Her durumda AYNI yanıt döner (kayıtlı e-postalar tahmin edilemesin).
   * E-posta arka planda gider; yanıt süresi kullanıcının varlığına bağlı değil.
   */
  async request(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, active: true, role: true },
    });

    if (user?.active && user.role === 'ADMIN' && this.mail.configured) {
      // Önceki kullanılmamış bağlantılar geçersiz
      await this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      const token = randomBytes(32).toString('base64url');
      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
      });
      const link = `${this.config.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${token}`;
      this.mail.sendInBackground({
        to: user.email,
        subject: 'Şifre sıfırlama bağlantısı',
        text: [
          'Merhaba,',
          '',
          'Yönetim paneli şifrenizi sıfırlamak için aşağıdaki bağlantıyı açın (30 dakika geçerlidir, tek kullanımlıktır):',
          '',
          link,
          '',
          'Bu isteği siz yapmadıysanız bu e-postayı yok sayın; şifreniz değişmez.',
        ].join('\n'),
      });
    } else if (user && !this.mail.configured) {
      this.logger.warn('Şifre sıfırlama istendi ama SMTP tanımlı değil.');
    }

    return GENERIC;
  }

  async reset(token: string, newPassword: string) {
    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hash(token) },
      include: { user: { select: { id: true, active: true } } },
    });
    if (!row || row.usedAt || row.expiresAt <= new Date() || !row.user.active) {
      throw new BadRequestException('Bağlantı geçersiz veya süresi dolmuş. Yeniden isteyin.');
    }

    // Tek kullanımlık: aynı anda iki istek gelirse yalnızca biri geçer
    const { count } = await this.prisma.passwordResetToken.updateMany({
      where: { id: row.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (count === 0) throw new BadRequestException('Bağlantı geçersiz veya süresi dolmuş. Yeniden isteyin.');

    await this.prisma.user.update({
      where: { id: row.userId },
      data: {
        passwordHash: await this.auth.hashPassword(newPassword),
        passwordChangedAt: new Date(Math.floor(Date.now() / 1000) * 1000),
      },
    });
    // Tüm açık oturumlar kapanır
    await this.sessions.revokeAll(row.userId);
    return { success: true };
  }
}
