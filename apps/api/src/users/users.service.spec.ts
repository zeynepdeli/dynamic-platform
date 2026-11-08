import { BadRequestException } from '@nestjs/common';

import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const prisma = { user: { findFirst: vi.fn(), count: vi.fn(), update: vi.fn(), findUnique: vi.fn(), create: vi.fn() } };
  const sessions = { revokeAll: vi.fn() };
  const service = new UsersService(prisma as never, { hashPassword: vi.fn() } as never, sessions as never);

  beforeEach(() => vi.clearAllMocks());

  it('kendi hesabını pasif yapamaz', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'me', active: true });
    await expect(service.setActive('me', 'me', false)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('son aktif yönetici pasif yapılamaz', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'b', active: true });
    prisma.user.count.mockResolvedValue(1);
    await expect(service.setActive('a', 'b', false)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('pasif yapılınca oturumları kapanır; şifre özeti dönmez', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'b', active: true });
    prisma.user.count.mockResolvedValue(2);
    prisma.user.update.mockResolvedValue({ id: 'b' });
    await service.setActive('a', 'b', false);
    expect(sessions.revokeAll).toHaveBeenCalledWith('b');
    expect(prisma.user.update.mock.calls[0][0].select).not.toHaveProperty('passwordHash');
  });
});
