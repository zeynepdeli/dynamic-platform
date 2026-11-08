import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordResetService } from './password-reset.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { login: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: PasswordResetService, useValue: {} },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  it('login isteğini servise iletir', async () => {
    authService.login.mockResolvedValue({ accessToken: 't' });
    const dto = { email: 'a@example.com', password: 'x'.repeat(12) };

    await expect(controller.login(dto)).resolves.toEqual({ accessToken: 't' });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });
});
