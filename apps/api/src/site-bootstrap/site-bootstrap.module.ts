import { Module } from '@nestjs/common';
import { SiteSettingsModule } from '../site-settings/site-settings.module.js';
import { MenuItemsModule } from '../menu-items/menu-items.module.js';
import { HeroSlidesModule } from '../hero-slides/hero-slides.module.js';
import { FooterSettingsModule } from '../footer-settings/footer-settings.module.js';
import { SiteBootstrapController } from './site-bootstrap.controller.js';
import { SiteBootstrapService } from './site-bootstrap.service.js';
import { SectionsModule } from '../sections/sections.module.js';
import { SocialLinksModule } from '../social-links/social-links.module.js';
import { MediaModule } from '../media/media.module.js';

@Module({
  imports: [
    SiteSettingsModule,
    MenuItemsModule,
    HeroSlidesModule,
    FooterSettingsModule,
    SectionsModule,
    SocialLinksModule,
    MediaModule,
  ],
  controllers: [SiteBootstrapController],
  providers: [SiteBootstrapService],
})
export class SiteBootstrapModule {}
