import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { assertSameIds } from '../../common/reorder.js';
import { isUniqueViolation } from '../../common/validators.js';
import { PrismaService } from '../../prisma/prisma.service.js';

import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto.js';

// Kaynak tüketimini sınırla (OWASP A04)
export const MAX_CATEGORIES = 200;

const PUBLIC_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  metaTitle: true,
  metaDescription: true,
} as const;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ziyaretçi: aktif kategoriler ve içlerindeki yayındaki ürün sayısı */
  async findPublic() {
    const categories = await this.prisma.productCategory.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        ...PUBLIC_SELECT,
        _count: { select: { products: { where: { active: true } } } },
      },
    });
    return categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));
  }

  async findPublicBySlug(slug: string) {
    const category = await this.prisma.productCategory.findFirst({
      where: { slug, active: true },
      select: PUBLIC_SELECT,
    });
    if (!category) throw new NotFoundException('Kategori bulunamadı.');
    return category;
  }

  async findAll() {
    const categories = await this.prisma.productCategory.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
    return categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));
  }

  async create(dto: CreateCategoryDto) {
    const count = await this.prisma.productCategory.count();
    if (count >= MAX_CATEGORIES) {
      throw new BadRequestException(`En fazla ${MAX_CATEGORIES} kategori oluşturulabilir.`);
    }

    try {
      return await this.prisma.productCategory.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug,
          description: dto.description ?? null,
          imageUrl: dto.imageUrl ?? null,
          active: dto.active ?? true,
          metaTitle: dto.metaTitle ?? null,
          metaDescription: dto.metaDescription ?? null,
          order: count, // en sona
        },
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.productCategory.update({
        where: { id },
        data: { ...dto, ...(dto.name ? { name: dto.name.trim() } : {}) },
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  /** İçinde ürün olan kategori silinmez (ürünler yanlışlıkla kategorisiz kalmasın). */
  async remove(id: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('Kategori bulunamadı.');
    if (category._count.products > 0) {
      throw new ConflictException(
        `Bu kategoride ${category._count.products} ürün var. Önce ürünleri başka bir kategoriye taşıyın.`,
      );
    }
    await this.prisma.productCategory.delete({ where: { id } });
    return { success: true };
  }

  async reorder(ids: string[]) {
    const existing = await this.prisma.productCategory.findMany({ select: { id: true } });
    assertSameIds(existing.map((c) => c.id), ids);
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.productCategory.update({ where: { id }, data: { order: index } }),
      ),
    );
    return this.findAll();
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.productCategory.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Kategori bulunamadı.');
  }

  private mapError(error: unknown) {
    if (isUniqueViolation(error)) {
      return new ConflictException('Bu adres (slug) başka bir kategoride kullanılıyor.');
    }
    return error;
  }
}
