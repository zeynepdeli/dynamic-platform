import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { FooterSettingsService } from './footer-settings.service.js';
import { UpdateFooterSettingsDto } from './dto/update-footer-settings.dto.js';

@Controller('admin/footer-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminFooterSettingsController {
  constructor(private readonly footerSettingsService: FooterSettingsService) {}

  // Admin panelinde footer ayarlarını getir.
  @Get()
  findAdmin() {
    return this.footerSettingsService.findAdmin();
  }

  // Footer ayarlarını güncelle.
  @Patch()
  update(@Body() dto: UpdateFooterSettingsDto) {
    return this.footerSettingsService.update(dto);
  }
}
