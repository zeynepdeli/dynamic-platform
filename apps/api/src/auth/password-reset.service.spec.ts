import { BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { PasswordResetService } from './password-reset.service.js';

const hash = (t: string) => createHash('sha256').update(t).digest('hex');

describe('PasswordResetService', () => {
  const prisma = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    passwordResetToken: { updateMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  };
  const mail = { configured: true, sendInBackground: vi.fn() };
  const auth = { hashPassword: vi.fn().mockResolvedValue('HASH') };
  const sessions = { revokeAll: vi.fn() };
  const config = { getOrThrow: () => 'https://admin.example.com' };
  const service = new PasswordResetService(prisma as never, mail as never, auth as never, sessions as never, config as never);

  beforeEach(() => vi.clearAllMocks());

  it('kayıtlı ve kayıtsız e-postada AYNI yanıtı verir', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const a = await service.request('yok@example.com');
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u', email: 'a@b.co', active: true, role: 'ADMIN' });
    const b = await service.request('a@b.co');
    expect(a).toEqual(b);
    expect(mail.sendInBackground).toHaveBeenCalledTimes(1);
  });

  it('bağlantıyı e-postayla gönderir, yalnızca özetini saklar', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u', email: 'a@b.co', active: true, role: 'ADMIN' });
    await service.request('A@B.co ');
    const text: string = mail.sendInBackground.mock.calls[0][0].text;
    const token = /token=([A-Za-z0-9_-]{43})/.exec(text)?.[1] as string;
    expect(token).toBeTruthy();
    expect(prisma.passwordResetToken.create.mock.calls[0][0].data.tokenHash).toBe(hash(token));
    expect(text).toContain('https://admin.example.com/reset-password?token=');
  });

  it('pasif kullanıcıya bağlantı göndermez', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u', email: 'a@b.co', active: false, role: 'ADMIN' });
    await service.request('a@b.co');
    expect(mail.sendInBackground).not.toHaveBeenCalled();
  });

  it('süresi dolmuş veya kullanılmış bağlantı reddedilir', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({ id: 't', userId: 'u', usedAt: new Date(), expiresAt: new Date(Date.now() + 1e6), user: { active: true } });
    await expect(service.reset('x'.repeat(43), 'yeni-sifre-12345')).rejects.toBeInstanceOf(BadRequestException);
    prisma.passwordResetToken.findUnique.mockResolvedValue({ id: 't', userId: 'u', usedAt: null, expiresAt: new Date(Date.now() - 1), user: { active: true } });
    await expect(service.reset('x'.repeat(43), 'yeni-sifre-12345')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('geçerli bağlantıyla şifreyi değiştirir ve tüm oturumları kapatır', async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({ id: 't', userId: 'u', usedAt: null, expiresAt: new Date(Date.now() + 1e6), user: { active: true } });
    prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    await service.reset('x'.repeat(43), 'yeni-sifre-12345');
    expect(prisma.user.update.mock.calls[0][0].data.passwordHash).toBe('HASH');
    expect(sessions.revokeAll).toHaveBeenCalledWith('u');
  });
});
