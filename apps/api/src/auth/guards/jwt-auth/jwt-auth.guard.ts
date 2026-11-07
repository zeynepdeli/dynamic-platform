import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { Request } from 'express';

type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'USER';
  iat?: number;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Oturum doğrulanamadı.');
    }

    const token = authorization.slice(7);

    if (!token) {
      throw new UnauthorizedException('Oturum doğrulanamadı.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new UnauthorizedException('Geçersiz oturum.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          passwordChangedAt: true,
        },
      });

      if (!user?.active) {
        throw new UnauthorizedException('Geçersiz oturum.');
      }

      // Şifre değiştikten ÖNCE verilmiş oturumlar geçersiz
      if (
        user.passwordChangedAt &&
        (typeof payload.iat !== 'number' ||
          payload.iat * 1000 < user.passwordChangedAt.getTime())
      ) {
        throw new UnauthorizedException('Oturumun süresi doldu.');
      }

      // Token'daki role güvenmek yerine güncel rolü
      // veritabanından alıyoruz.
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Oturum doğrulanamadı.');
    }
  }
}
