import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { SectionsService } from './sections.service.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// PUBLIC: Yalnızca aktif bölümler/kartlar ve yayındaki sayfalar
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  // GET /sections/home
  @Get('home')
  findHome() {
    return this.sectionsService.findPublicHome();
  }

  // GET /sections/page/:slug
  @Get('page/:slug')
  findByPage(@Param('slug') slug: string) {
    // Geçersiz slug DB'ye hiç gitmez
    if (slug.length > 150 || !SLUG_REGEX.test(slug)) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return this.sectionsService.findPublicByPageSlug(slug);
  }
}
