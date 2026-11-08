import { Controller, Get, HttpCode, HttpStatus, Post, Req, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { MailService } from './mail.service.js';

@Controller('admin/mail')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Get('status')
  status() {
    return { configured: this.mail.configured };
  }

  // Deneme e-postası yalnızca giriş yapan yöneticinin kendi adresine gider
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async test(@Req() req: Request) {
    if (!this.mail.configured) throw new ServiceUnavailableException('E-posta (SMTP) ayarlanmamış.');
    const email = (req.user as { email: string }).email;
    try {
      await this.mail.send({ to: email, subject: 'Deneme e-postası', text: 'E-posta ayarlarınız çalışıyor.' });
    } catch {
      throw new ServiceUnavailableException('E-posta gönderilemedi. SMTP bilgilerini kontrol edin.');
    }
    return { success: true, to: email };
  }
}
