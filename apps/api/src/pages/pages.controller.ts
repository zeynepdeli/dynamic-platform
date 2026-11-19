import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { PagesService } from './pages.service.js';

// Bu controller yalnızca ziyaretçiye açık (PUBLIC) uçları içerir.
// Tüm yönetim işlemleri /admin/pages altında, AdminPagesController'dadır.
@Controller('pages')
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly i18n: I18nService,
  ) {}

  // PUBLIC: Yayındaki sayfaların listesi (menü, sitemap vb. için)
  @Get()
  async findAll(@Query('lang', LangPipe) lang?: string) {
    const { locale, defaultLocale, locales } = await this.i18n.resolve(lang);
    return this.pagesService.findAll(locale, defaultLocale, locales);
  }

  // PUBLIC: Slug ile tek sayfa
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Query('lang', LangPipe) lang?: string) {
    // Slug formatı DTO'daki kural ile aynıdır; uymayan istek DB'ye hiç gitmez.
    if (slug.length > 150 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    const { locale, defaultLocale, locales } = await this.i18n.resolve(lang);
    return this.pagesService.findPublishedBySlug(slug, locale, defaultLocale, locales);
  }
}
