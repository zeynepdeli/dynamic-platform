import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { FooterSettingsController } from './footer-settings.controller.js';
import { AdminFooterSettingsController } from './admin-footer-settings.controller.js';

import { FooterSettingsService } from './footer-settings.service.js';

@Module({
  imports: [AuthModule],
  controllers: [FooterSettingsController, AdminFooterSettingsController],
  providers: [FooterSettingsService],
  exports: [FooterSettingsService],
})
export class FooterSettingsModule {}
