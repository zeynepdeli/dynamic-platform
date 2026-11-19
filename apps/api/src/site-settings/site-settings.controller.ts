import { Controller, Get, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { SiteSettingsService } from './site-settings.service.js';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(
    private readonly siteSettingsService: SiteSettingsService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async getSettings(@Query('lang', LangPipe) lang?: string) {
    return this.siteSettingsService.getPublicSettings(await this.i18n.context(lang));
  }
}
