import { Injectable } from '@nestjs/common';
import { SiteSettingsService } from '../site-settings/site-settings.service.js';
import { MenuItemsService } from '../menu-items/menu-items.service.js';
import { HeroSlidesService } from '../hero-slides/hero-slides.service.js';
import { FooterSettingsService } from '../footer-settings/footer-settings.service.js';
import { SectionsService } from '../sections/sections.service.js';
import { SocialLinksService } from '../social-links/social-links.service.js';
import { MediaService } from '../media/media.service.js';

@Injectable()
export class SiteBootstrapService {
  constructor(
    private readonly siteSettingsService: SiteSettingsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly heroSlidesService: HeroSlidesService,
    private readonly footerSettingsService: FooterSettingsService,
    private readonly sectionsService: SectionsService,
    private readonly socialLinksService: SocialLinksService,
    private readonly mediaService: MediaService,
  ) {}

  async getBootstrap() {
    const [settings, menuItems, heroSlides, footer, homeSections, socialLinks, mediaAlts] =
      await Promise.all([
        this.siteSettingsService.getSettings(),
        this.menuItemsService.findPublic(),
        this.heroSlidesService.findPublic(),
        this.footerSettingsService.findPublic(),
        this.sectionsService.findPublicHome(),
        this.socialLinksService.findPublic(),
        this.mediaService.findAltMap(),
      ]);

    return {
      settings,
      menuItems,
      heroSlides,
      footer,
      homeSections,
      socialLinks,
      // Görsel adresi → açıklama (sitede <img alt>)
      mediaAlts,
    };
  }
}
