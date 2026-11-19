import { Controller, Get, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { SiteBootstrapService } from './site-bootstrap.service.js';

@Controller('site')
export class SiteBootstrapController {
  constructor(
    private readonly siteBootstrapService: SiteBootstrapService,
    private readonly i18n: I18nService,
  ) {}

  @Get('bootstrap')
  async getBootstrap(@Query('lang', LangPipe) lang?: string) {
    return this.siteBootstrapService.getBootstrap(await this.i18n.context(lang));
  }
}
