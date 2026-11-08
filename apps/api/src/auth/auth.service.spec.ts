import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service.js';
import { SessionsService } from './sessions.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = { user: { findUnique: vi.fn() } };
  const jwtService = { signAsync: vi.fn().mockResolvedValue('signed.jwt') };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: SessionsService, useValue: { create: vi.fn().mockResolvedValue('r'.repeat(43)), revokeAll: vi.fn(), purgeExpired: vi.fn(), rotate: vi.fn(), revoke: vi.fn() } },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('kayıtsız e-postada da parola doğrulaması çalıştırır (timing-safe)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const verifySpy = vi.spyOn(service, 'verifyPassword');

    await expect(
      service.login({ email: 'yok@example.com', password: 'x'.repeat(12) }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifySpy).toHaveBeenCalledTimes(1);
  });

  it('pasif kullanıcıya token vermez', async () => {
    const password = 'dogru-parola-123';
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@example.com',
      role: 'ADMIN',
      active: false,
      passwordHash: await service.hashPassword(password),
    });

    await expect(
      service.login({ email: 'a@example.com', password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('doğru bilgilerle yalnızca sub ve role içeren token üretir', async () => {
    const password = 'dogru-parola-123';
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@example.com',
      role: 'ADMIN',
      active: true,
      passwordHash: await service.hashPassword(password),
    });

    await expect(
      service.login({ email: ' A@Example.com ', password }),
    ).resolves.toMatchObject({ accessToken: 'signed.jwt' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      role: 'ADMIN',
    });
  });
});

describe('AuthService.changePassword', () => {
  let service: AuthService;
  const prisma = { user: { findUnique: vi.fn(), update: vi.fn() } };
  const jwt = { signAsync: vi.fn().mockResolvedValue('new-token') };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: SessionsService, useValue: { create: vi.fn().mockResolvedValue('r'.repeat(43)), revokeAll: vi.fn(), purgeExpired: vi.fn(), rotate: vi.fn(), revoke: vi.fn() } },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('mevcut şifre hatalıysa değiştirmez', async () => {
    const hash = await service.hashPassword('dogru-sifre-123');
    prisma.user.findUnique.mockResolvedValue({ id: 'u', role: 'ADMIN', active: true, passwordHash: hash });
    await expect(service.changePassword('u', 'yanlis-sifre-12', 'yeni-sifre-12345')).rejects.toThrow('Mevcut şifre hatalı.');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('şifreyi değiştirir, eski oturumları geçersiz kılar, yeni token döner', async () => {
    const hash = await service.hashPassword('dogru-sifre-123');
    prisma.user.findUnique.mockResolvedValue({ id: 'u', role: 'ADMIN', active: true, passwordHash: hash });
    const result = await service.changePassword('u', 'dogru-sifre-123', 'yeni-sifre-12345');
    expect(result.accessToken).toBe('new-token');
    const data = prisma.user.update.mock.calls[0][0].data;
    expect(data.passwordChangedAt).toBeInstanceOf(Date);
    expect(await service.verifyPassword(data.passwordHash, 'yeni-sifre-12345')).toBe(true);
  });
});
