import { Injectable } from '@nestjs/common';

import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { MenuItemsService } from '../menu-items/menu-items.service.js';
import { HeroSlidesService } from '../hero-slides/hero-slides.service.js';
import { FooterSettingsService } from '../footer-settings/footer-settings.service.js';

@Injectable()
export class SiteBootstrapService {
  constructor(
    private readonly siteSettingsService: SiteSettingsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly heroSlidesService: HeroSlidesService,
    private readonly footerSettingsService: FooterSettingsService,
  ) {}

  async getBootstrap() {
    const [settings, menuItems, heroSlides, footer] = await Promise.all([
      this.siteSettingsService.getSettings(),
      this.menuItemsService.findPublic(),
      this.heroSlidesService.findPublic(),
      this.footerSettingsService.findPublic(),
    ]);

    return {
      settings,
      menuItems,
      heroSlides,
      footer,
    };
  }
}
