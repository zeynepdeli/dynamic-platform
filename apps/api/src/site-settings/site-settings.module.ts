import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { SiteSettingsService } from './site-settings.service.js';
import { SiteSettingsController } from './site-settings.controller.js';
import { AdminSiteSettingsController } from './admin-site-settings.controller.js';

@Module({
  imports: [AuthModule],

  controllers: [SiteSettingsController, AdminSiteSettingsController],

  providers: [SiteSettingsService],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
