import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

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

  // PUBLIC: Yayındaki ve silinmemiş sayfalar
  async findAll() {
    return this.prisma.page.findMany({
      where: {
        published: true,
        deletedAt: null,
      },
      select: this.publicListSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // PUBLIC: Slug ile yayındaki tek sayfa
  async findPublishedBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: {
        slug,
        published: true,
        deletedAt: null,
      },
      select: {
        ...this.publicListSelect,
        content: true,
        seoKeywords: true,
      },
    });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return page;
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
    const existingPage = await this.prisma.page.findFirst({
      where: {
        slug: dto.slug,
      },
    });

    if (existingPage) {
      throw new ConflictException('Bu URL adresi zaten kullanılıyor.');
    }

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
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  // ADMIN: Sayfa güncelle
  async update(id: string, dto: UpdatePageDto) {
    await this.findOneForAdmin(id);

    if (dto.slug !== undefined) {
      const existingPage = await this.prisma.page.findFirst({
        where: {
          slug: dto.slug,
          id: {
            not: id,
          },
        },
      });

      if (existingPage) {
        throw new ConflictException(
          'Bu URL adresi başka bir sayfada kullanılıyor.',
        );
      }
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
