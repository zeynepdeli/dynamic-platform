import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { SocialLinksController } from './social-links.controller.js';
import { AdminSocialLinksController } from './admin-social-links.controller.js';
import { SocialLinksService } from './social-links.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SocialLinksController, AdminSocialLinksController],
  providers: [SocialLinksService],
  exports: [SocialLinksService],
})
export class SocialLinksModule {}
