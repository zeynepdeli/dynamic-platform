import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { SLUG_REGEX } from './dto/create-post.dto.js';
import { POSTS_PAGE_SIZE, PostsService } from './posts.service.js';

// Ziyaretçiye açık uçlar. Yönetim: /admin/posts
@Controller('posts')
export class PostsController {
  constructor(
    private readonly posts: PostsService,
    private readonly i18n: I18nService,
  ) {}

  // GET /posts?page=1&limit=12&lang=en
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('lang', LangPipe) lang?: string,
  ) {
    return this.posts.findPublic(
      await this.i18n.resolve(lang),
      toPositiveInt(page, 1),
      toPositiveInt(limit, POSTS_PAGE_SIZE),
    );
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Query('lang', LangPipe) lang?: string) {
    // Biçimi uymayan adres DB'ye hiç gitmez
    if (slug.length > 150 || !SLUG_REGEX.test(slug)) throw new NotFoundException('Yazı bulunamadı.');
    return this.posts.findPublicBySlug(slug, await this.i18n.resolve(lang));
  }
}

/** Sayfa parametresi: tam sayı değilse varsayılan (ziyaretçi uçlarında hata yerine güvenli değer) */
export function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'string' || !/^\d{1,6}$/.test(value)) return fallback;
  const n = Number(value);
  return n >= 1 ? n : fallback;
}
