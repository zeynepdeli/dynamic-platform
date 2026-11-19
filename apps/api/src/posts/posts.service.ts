import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client.js';
import { I18nService } from '../i18n/i18n.service.js';
import { type Locale, SUPPORTED_LOCALES } from '../i18n/locales.js';
import { localize, mergeTranslations, pathFor, slugFor, TRANSLATABLE } from '../i18n/localize.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

export const POSTS_PAGE_SIZE = 12;
export const POSTS_MAX_PAGE_SIZE = 50;

type LocaleCtx = { locale: Locale; defaultLocale: Locale; locales: Locale[] };

/** Sitede blog yazılarının adresi: /blog/<slug> (diğer dillerde /en/blog/<slug>) */
export const postPath = (locale: Locale, defaultLocale: Locale, slug: string) =>
  pathFor(locale, defaultLocale, `blog/${slug}`);

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  // Liste kartı için gereken alanlar (içerik hariç)
  private readonly listSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    coverImageUrl: true,
    category: true,
    publishedAt: true,
    updatedAt: true,
    translations: true,
  } satisfies Prisma.PostSelect;

  /** Ziyaretçiye görünen yazı: yayında ve yayın tarihi gelmiş */
  private visibleWhere(): Prisma.PostWhereInput {
    return { published: true, publishedAt: { lte: new Date() } };
  }

  // PUBLIC: sayfalı liste, en yeni önce
  async findPublic(ctx: LocaleCtx, page = 1, pageSize = POSTS_PAGE_SIZE) {
    const take = Math.min(Math.max(pageSize, 1), POSTS_MAX_PAGE_SIZE);
    const current = Math.min(Math.max(page, 1), 10_000);
    const where = this.visibleWhere();
    const [rows, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        select: this.listSelect,
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        skip: (current - 1) * take,
        take,
      }),
      this.prisma.post.count({ where }),
    ]);
    return {
      items: rows.map((r) => this.toPublic(r, ctx)),
      total,
      page: current,
      pageSize: take,
      totalPages: Math.max(Math.ceil(total / take), 1),
    };
  }

  // PUBLIC: istenen dildeki adresle tek yazı
  async findPublicBySlug(slug: string, ctx: LocaleCtx) {
    const { locale, defaultLocale } = ctx;
    const candidates = await this.prisma.post.findMany({
      where: {
        ...this.visibleWhere(),
        ...(locale === defaultLocale
          ? { slug }
          : { OR: [{ slug }, { translations: { path: [locale, 'slug'], equals: slug } }] }),
      },
      select: { ...this.listSelect, content: true, seoTitle: true, seoDescription: true },
    });
    const post = candidates.find((p) => slugFor(p, locale, defaultLocale) === slug);
    if (!post) throw new NotFoundException('Yazı bulunamadı.');
    return this.toPublic(post, ctx);
  }

  /** Metinler istenen dilde, çeviriler dışarı çıkmaz; her dildeki adres (hreflang, dil seçici) eklenir */
  private toPublic<T extends { slug: string; translations: unknown }>(post: T, ctx: LocaleCtx) {
    const { locale, defaultLocale, locales } = ctx;
    const alternates = Object.fromEntries(
      locales.map((l) => [l, postPath(l, defaultLocale, slugFor(post, l, defaultLocale))]),
    );
    return {
      ...localize(post, locale, defaultLocale, TRANSLATABLE.post),
      slug: slugFor(post, locale, defaultLocale),
      alternates,
    };
  }

  // ADMIN
  findAllForAdmin() {
    return this.prisma.post.findMany({
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        coverImageUrl: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
  }

  async findOneForAdmin(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Yazı bulunamadı.');
    return post;
  }

  async create(dto: CreatePostDto) {
    const translations = mergeTranslations({}, dto.translations) ?? {};
    await this.assertSlugsAvailable(null, dto.slug, translations);
    const published = dto.published ?? false;
    try {
      return await this.prisma.post.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          excerpt: dto.excerpt ?? null,
          content: dto.content ?? null,
          coverImageUrl: dto.coverImageUrl ?? null,
          category: dto.category ?? null,
          published,
          // Tarih verilmediyse yayınlandığı an
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : published ? new Date() : null,
          seoTitle: dto.seoTitle ?? null,
          seoDescription: dto.seoDescription ?? null,
          translations,
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdatePostDto) {
    const current = await this.findOneForAdmin(id);
    const translations = mergeTranslations(current.translations, dto.translations);
    if (dto.slug !== undefined || translations !== undefined) {
      await this.assertSlugsAvailable(id, dto.slug ?? current.slug, translations ?? current.translations);
    }

    // İlk kez yayına alınan ve tarihi olmayan yazı: şimdi yayınlandı
    let publishedAt: Date | null | undefined =
      dto.publishedAt === undefined ? undefined : dto.publishedAt === null ? null : new Date(dto.publishedAt);
    const willBePublished = dto.published ?? current.published;
    const finalDate = publishedAt === undefined ? current.publishedAt : publishedAt;
    if (willBePublished && !finalDate) publishedAt = new Date();

    const { translations: _t, publishedAt: _p, ...rest } = dto;
    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          ...rest,
          ...(publishedAt !== undefined && { publishedAt }),
          ...(translations !== undefined && { translations }),
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOneForAdmin(id);
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }

  /** Her dilde blog adresi benzersiz olmalı (çevirisi olmayan yazı o dilde ana slug'ı kullanır) */
  private async assertSlugsAvailable(id: string | null, slug: string, translations: unknown) {
    const { defaultLocale } = await this.i18n.config();
    const others = await this.prisma.post.findMany({
      where: id ? { id: { not: id } } : {},
      select: { slug: true, translations: true },
    });
    const candidate = { slug, translations };
    for (const locale of SUPPORTED_LOCALES) {
      const mine = slugFor(candidate, locale, defaultLocale);
      if (others.some((o) => slugFor(o, locale, defaultLocale) === mine)) {
        throw new ConflictException(
          locale === defaultLocale
            ? 'Bu adres başka bir yazıda kullanılıyor.'
            : `Bu yazının ${locale.toUpperCase()} adresi (${mine}) başka bir yazıda kullanılıyor.`,
        );
      }
    }
  }

  private handlePrismaError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') throw new ConflictException('Bu adres başka bir yazıda kullanılıyor.');
      if (error.code === 'P2025') throw new NotFoundException('Yazı bulunamadı.');
    }
    throw error;
  }
}
