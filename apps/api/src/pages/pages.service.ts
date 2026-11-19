import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client.js';
import { I18nService } from '../i18n/i18n.service.js';
import { type Locale, SUPPORTED_LOCALES } from '../i18n/locales.js';
import { localize, mergeTranslations, pathFor, slugFor, TRANSLATABLE } from '../i18n/localize.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';

@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  // Ziyaretçiye dönen alanlar. deletedAt/published gibi iç alanlar
  // ve liste görünümünde gereksiz olan content dışarıda bırakılır.
  private readonly publicListSelect = {
    id: true,
    title: true,
    slug: true,
    seoTitle: true,
    seoDescription: true,
    ogImageUrl: true,
    noIndex: true,
    backgroundColor: true,
    backgroundImage: true,
    updatedAt: true,
  } satisfies Prisma.PageSelect;

  // PUBLIC: Yayındaki ve silinmemiş sayfalar (istenen dilde; her dildeki adresleriyle)
  async findAll(locale: Locale = 'tr', defaultLocale: Locale = 'tr', locales: Locale[] = ['tr']) {
    const pages = await this.prisma.page.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      select: { ...this.publicListSelect, translations: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return pages.map((p) => this.toPublic(p, locale, defaultLocale, locales));
  }

  // PUBLIC: Slug ile yayındaki tek sayfa. Slug, istenen dildeki adrestir (/en/about-us → "about-us").
  async findPublishedBySlug(slug: string, locale: Locale = 'tr', defaultLocale: Locale = 'tr', locales: Locale[] = ['tr']) {
    const candidates = await this.prisma.page.findMany({
      where: {
        published: true,
        deletedAt: null,
        // Ana dilde doğrudan sütun; diğer dillerde çeviri ya da (çeviri yoksa) ana slug
        ...(locale === defaultLocale
          ? { slug }
          : { OR: [{ slug }, { translations: { path: [locale, 'slug'], equals: slug } }] }),
      },
      select: {
        ...this.publicListSelect,
        content: true,
        seoKeywords: true,
        translations: true,
      },
    });
    const page = candidates.find((p) => slugFor(p, locale, defaultLocale) === slug);

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return this.toPublic(page, locale, defaultLocale, locales);
  }

  /** Ziyaretçiye dönen sayfa: istenen dilde metinler + her açık dildeki adresi (hreflang, dil seçici) */
  private toPublic<T extends { slug: string; translations: unknown }>(
    page: T,
    locale: Locale,
    defaultLocale: Locale,
    locales: Locale[],
  ) {
    const alternates = Object.fromEntries(
      locales.map((l) => [l, pathFor(l, defaultLocale, slugFor(page, l, defaultLocale))]),
    );
    return { ...localize(page, locale, defaultLocale, TRANSLATABLE.page), slug: slugFor(page, locale, defaultLocale), alternates };
  }

  /**
   * Her dilde adres benzersiz olmalı. Bir sayfanın çevirisi yoksa o dilde ana slug'ı kullanılır;
   * bu yüzden çakışma "etkin adres" üzerinden denetlenir (silinmiş sayfalar geri yüklenince de).
   */
  private async assertSlugsAvailable(id: string | null, slug: string, translations: unknown) {
    const { defaultLocale } = await this.i18n.config();
    const others = await this.prisma.page.findMany({
      where: { deletedAt: null, ...(id ? { id: { not: id } } : {}) },
      select: { slug: true, translations: true },
    });
    const candidate = { slug, translations };
    for (const locale of SUPPORTED_LOCALES) {
      const mine = slugFor(candidate, locale, defaultLocale);
      if (others.some((o) => slugFor(o, locale, defaultLocale) === mine)) {
        throw new ConflictException(
          locale === defaultLocale
            ? 'Bu URL adresi zaten kullanılıyor.'
            : `Bu sayfanın ${locale.toUpperCase()} adresi (${mine}) başka bir sayfada kullanılıyor.`,
        );
      }
    }
  }

  // ADMIN: Tüm aktif sayfalar
  async findAllForAdmin() {
    return this.prisma.page.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ADMIN: Tek sayfanın bütün bilgileri
  async findOneForAdmin(id: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return page;
  }

  // ADMIN: Yeni sayfa oluştur
  async create(dto: CreatePageDto) {
    const translations = mergeTranslations({}, dto.translations) ?? {};
    await this.assertSlugsAvailable(null, dto.slug, translations);

    try {
      return await this.prisma.page.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          content: dto.content ?? '',
          published: dto.published ?? false,

          seoTitle: dto.seoTitle ?? null,
          seoDescription: dto.seoDescription ?? null,
          seoKeywords: dto.seoKeywords ?? null,
          ogImageUrl: dto.ogImageUrl ?? null,
          backgroundColor: dto.backgroundColor ?? null,
          backgroundImage: dto.backgroundImage ?? null,
          noIndex: dto.noIndex ?? false,
          translations,
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  // ADMIN: Sayfa güncelle
  async update(id: string, dto: UpdatePageDto) {
    const current = await this.findOneForAdmin(id);
    const translations = mergeTranslations(current.translations, dto.translations);

    if (dto.slug !== undefined || translations !== undefined) {
      await this.assertSlugsAvailable(id, dto.slug ?? current.slug, translations ?? current.translations);
    }

    try {
      return await this.prisma.page.update({
        where: {
          id,
        },
        data: {
          ...(dto.title !== undefined && {
            title: dto.title,
          }),

          ...(dto.slug !== undefined && {
            slug: dto.slug,
          }),

          ...(dto.content !== undefined && {
            content: dto.content,
          }),

          ...(dto.published !== undefined && {
            published: dto.published,
          }),

          ...(dto.seoTitle !== undefined && {
            seoTitle: dto.seoTitle,
          }),

          ...(dto.seoDescription !== undefined && {
            seoDescription: dto.seoDescription,
          }),

          ...(dto.seoKeywords !== undefined && {
            seoKeywords: dto.seoKeywords,
          }),

          ...(dto.ogImageUrl !== undefined && {
            ogImageUrl: dto.ogImageUrl,
          }),

          ...(dto.noIndex !== undefined && {
            noIndex: dto.noIndex,
          }),

          ...(dto.backgroundColor !== undefined && {
            backgroundColor: dto.backgroundColor,
          }),

          ...(dto.backgroundImage !== undefined && {
            backgroundImage: dto.backgroundImage,
          }),

          ...(translations !== undefined && { translations }),
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  // ADMIN: Sayfayı çöp kutusuna taşı
  async remove(id: string) {
    await this.findOneForAdmin(id);

    try {
      return await this.prisma.page.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
          published: false,
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  // ADMIN: Silinmiş sayfalar
  async findDeleted() {
    return this.prisma.page.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });
  }

  // ADMIN: Silinen sayfayı geri yükle
  async restore(id: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Geri yüklenecek sayfa bulunamadı.');
    }
    await this.assertSlugsAvailable(page.id, page.slug, page.translations);

    try {
      return await this.prisma.page.update({
        where: {
          id,
        },
        data: {
          deletedAt: null,
          published: false,
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    ) {
      if (error.code === 'P2002') {
        throw new ConflictException('Bu URL adresi zaten kullanılıyor.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Sayfa bulunamadı.');
      }
    }

    throw error;
  }
}
