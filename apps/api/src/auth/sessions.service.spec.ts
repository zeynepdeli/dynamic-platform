import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';

import { SessionsService } from './sessions.service.js';

const hash = (t: string) => createHash('sha256').update(t).digest('hex');

describe('SessionsService', () => {
  const prisma = {
    refreshSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  const service = new SessionsService(prisma as never);
  const future = new Date(Date.now() + 60_000);
  const user = { id: 'u1', role: 'ADMIN', active: true };

  beforeEach(() => vi.clearAllMocks());

  it('anahtarın kendisini değil özetini saklar', async () => {
    const token = await service.create('u1');
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const data = prisma.refreshSession.create.mock.calls[0][0].data;
    expect(data.tokenHash).toBe(hash(token));
    expect(JSON.stringify(data)).not.toContain(token);
  });

  it('döndürür: eskisini kapatır, yenisini verir, üst sınırı korur', async () => {
    prisma.refreshSession.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', revokedAt: null, expiresAt: future, absoluteExpiresAt: future, user });
    prisma.refreshSession.updateMany.mockResolvedValue({ count: 1 });
    const result = await service.rotate('eski');
    expect(result.refreshToken).not.toBe('eski');
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 's1', revokedAt: null } }));
    expect(prisma.refreshSession.create.mock.calls[0][0].data.absoluteExpiresAt).toBe(future);
  });

  it('kullanılmış anahtar tekrar gelirse TÜM oturumları kapatır', async () => {
    prisma.refreshSession.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', revokedAt: new Date(), expiresAt: future, absoluteExpiresAt: future, user });
    await expect(service.rotate('calinti')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u1', revokedAt: null } }));
    expect(prisma.refreshSession.create).not.toHaveBeenCalled();
  });

  it('süresi geçmiş veya pasif kullanıcı reddedilir', async () => {
    prisma.refreshSession.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', revokedAt: null, expiresAt: new Date(Date.now() - 1), absoluteExpiresAt: future, user });
    await expect(service.rotate('x')).rejects.toBeInstanceOf(UnauthorizedException);
    prisma.refreshSession.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', revokedAt: null, expiresAt: future, absoluteExpiresAt: future, user: { ...user, active: false } });
    await expect(service.rotate('x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('aynı anda iki yenilemede yalnızca biri kazanır', async () => {
    prisma.refreshSession.findUnique.mockResolvedValue({ id: 's1', userId: 'u1', revokedAt: null, expiresAt: future, absoluteExpiresAt: future, user });
    prisma.refreshSession.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.rotate('x')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
