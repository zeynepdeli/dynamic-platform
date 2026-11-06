import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { HeroSlidesController } from './hero-slides.controller.js';
import { AdminHeroSlidesController } from './admin-hero-slides.controller.js';
import { HeroSlidesService } from './hero-slides.service.js';

@Module({
  imports: [AuthModule],
  controllers: [HeroSlidesController, AdminHeroSlidesController],
  providers: [HeroSlidesService],
  exports: [HeroSlidesService],
})
export class HeroSlidesModule {}
