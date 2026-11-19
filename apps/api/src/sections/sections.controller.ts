import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { SectionsService } from './sections.service.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// PUBLIC: Yalnızca aktif bölümler/kartlar ve yayındaki sayfalar
@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly i18n: I18nService,
  ) {}

  // GET /sections/home
  @Get('home')
  async findHome(@Query('lang', LangPipe) lang?: string) {
    return this.sectionsService.findPublicHome(await this.i18n.context(lang));
  }

  // GET /sections/page/:slug
  @Get('page/:slug')
  async findByPage(@Param('slug') slug: string, @Query('lang', LangPipe) lang?: string) {
    // Geçersiz slug DB'ye hiç gitmez
    if (slug.length > 150 || !SLUG_REGEX.test(slug)) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return this.sectionsService.findPublicByPageSlug(slug, await this.i18n.context(lang));
  }
}
