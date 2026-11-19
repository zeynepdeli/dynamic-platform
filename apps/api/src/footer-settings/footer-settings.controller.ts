import { Controller, Get, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { FooterSettingsService } from './footer-settings.service.js';

@Controller('footer-settings')
export class FooterSettingsController {
  constructor(
    private readonly footerSettingsService: FooterSettingsService,
    private readonly i18n: I18nService,
  ) {}

  // Herkese açık footer bilgilerini getir.
  @Get()
  async findPublic(@Query('lang', LangPipe) lang?: string) {
    return this.footerSettingsService.findLocalized(await this.i18n.context(lang));
  }
}
