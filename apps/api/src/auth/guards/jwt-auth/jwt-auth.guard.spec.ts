import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { PrismaService } from '../../../prisma/prisma.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const SECRET = 'x'.repeat(64);
const jwt = new JwtService({ secret: SECRET });

function setup(user: unknown) {
  const prisma = { user: { findUnique: vi.fn().mockResolvedValue(user) } };
  const guard = new JwtAuthGuard(jwt, prisma as unknown as PrismaService);
  const request: Record<string, any> = { headers: {} };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { guard, request, context };
}

const activeUser = { id: 'u1', email: 'a@b.co', role: 'ADMIN', active: true, passwordChangedAt: null };

describe('JwtAuthGuard', () => {
  it('geçerli token ile kullanıcıyı (güncel rolüyle) isteğe ekler', async () => {
    const { guard, request, context } = setup(activeUser);
    request.headers.authorization = `Bearer ${await jwt.signAsync({ sub: 'u1', role: 'USER' })}`;
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'u1', email: 'a@b.co', role: 'ADMIN' });
  });

  it('token yoksa veya imza yanlışsa reddeder', async () => {
    const { guard, request, context } = setup(activeUser);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    const forged = await new JwtService({ secret: 'y'.repeat(64) }).signAsync({ sub: 'u1' });
    request.headers.authorization = `Bearer ${forged}`;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('pasif kullanıcıyı reddeder', async () => {
    const { guard, request, context } = setup({ ...activeUser, active: false });
    request.headers.authorization = `Bearer ${await jwt.signAsync({ sub: 'u1' })}`;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('şifre değişikliğinden önce verilmiş token reddedilir', async () => {
    const { guard, request, context } = setup({ ...activeUser, passwordChangedAt: new Date(Date.now() + 60_000) });
    request.headers.authorization = `Bearer ${await jwt.signAsync({ sub: 'u1' })}`;
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
