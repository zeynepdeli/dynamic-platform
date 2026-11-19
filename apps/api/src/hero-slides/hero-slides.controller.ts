import { Controller, Get, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { HeroSlidesService } from './hero-slides.service.js';

@Controller('hero-slides')
export class HeroSlidesController {
  constructor(
    private readonly heroSlidesService: HeroSlidesService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async findPublic(@Query('lang', LangPipe) lang?: string) {
    return this.heroSlidesService.findPublic(await this.i18n.context(lang));
  }
}
