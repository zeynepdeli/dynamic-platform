import { Module } from '@nestjs/common';

import { SiteSettingsModule } from '../site-settings/site-settings.module.js';
import { MenuItemsModule } from '../menu-items/menu-items.module.js';
import { HeroSlidesModule } from '../hero-slides/hero-slides.module.js';
import { FooterSettingsModule } from '../footer-settings/footer-settings.module.js';

import { SiteBootstrapController } from './site-bootstrap.controller.js';
import { SiteBootstrapService } from './site-bootstrap.service.js';

@Module({
  imports: [
    SiteSettingsModule,
    MenuItemsModule,
    HeroSlidesModule,
    FooterSettingsModule,
  ],
  controllers: [SiteBootstrapController],
  providers: [SiteBootstrapService],
})
export class SiteBootstrapModule {}
