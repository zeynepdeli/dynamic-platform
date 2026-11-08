import {
  Body,
  Patch,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto.js';
import { PasswordResetService } from './password-reset.service.js';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      module: 'auth',
    };
  }

  // ThrottlerGuard app.module'de global olarak tanımlı. Burada ayrıca
  // @UseGuards(ThrottlerGuard) eklemek her denemeyi İKİ kez saydırır.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Şifremi unuttum: her durumda aynı yanıt; e-posta bombardımanına karşı sıkı sınır
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 }, long: { limit: 10, ttl: 3_600_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordReset.request(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordReset.reset(dto.token, dto.newPassword);
  }

  // Oturumu yenile (anahtar döner; eskisi geçersiz olur)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto) {
    await this.authService.logout(dto.refreshToken);
  }

  // Kaba kuvvete karşı sıkı sınır
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  changePassword(@Req() request: Request, @Body() dto: ChangePasswordDto) {
    const user = request.user as { id: string };
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request: Request) {
    return request.user;
  }
}
