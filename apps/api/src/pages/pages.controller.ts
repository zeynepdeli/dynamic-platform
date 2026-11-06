import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { PagesService } from './pages.service.js';

// Bu controller yalnızca ziyaretçiye açık (PUBLIC) uçları içerir.
// Tüm yönetim işlemleri /admin/pages altında, AdminPagesController'dadır.
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // PUBLIC: Yayındaki sayfaların listesi (menü, sitemap vb. için)
  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  // PUBLIC: Slug ile tek sayfa
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    // Slug formatı DTO'daki kural ile aynıdır; uymayan istek DB'ye hiç gitmez.
    if (slug.length > 150 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return this.pagesService.findPublishedBySlug(slug);
  }
}
