import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Prisma } from '../../generated/prisma/client.js';
import { isUniqueViolation } from '../../common/validators.js';
import { PrismaService } from '../../prisma/prisma.service.js';

import type { AdminProductQueryDto, ProductSort, PublicProductQueryDto } from './dto/catalog-query.dto.js';
import type { CreateProductDto, ProductImageDto, ProductTabDto, UpdateProductDto } from './dto/product.dto.js';

/** Bu adedin altındaki stok admin'de "azaldı" olarak işaretlenir */
export const LOW_STOCK_THRESHOLD = 5;
// Kaynak tüketimini sınırla (OWASP A04)
export const MAX_PRODUCTS = 5000;

type Money = { toFixed(digits: number): string };
const money = (value: Money | null) => (value == null ? null : value.toFixed(2));

/** Ziyaretçiye yalnızca yayındaki ürünler; kategorisi gizliyse ürün de gizli */
const VISIBLE: Prisma.ProductWhereInput = {
  active: true,
  OR: [{ categoryId: null }, { category: { active: true } }],
};

const SORTS: Record<ProductSort, Prisma.ProductOrderByWithRelationInput[]> = {
  new: [{ createdAt: 'desc' }, { id: 'asc' }],
  'price-asc': [{ price: 'asc' }, { id: 'asc' }],
  'price-desc': [{ price: 'desc' }, { id: 'asc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
};

const searchWhere = (q?: string): Prisma.ProductWhereInput =>
  q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────── Ziyaretçi ─────────────

  async findPublic(query: PublicProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const where: Prisma.ProductWhereInput = {
      AND: [
        VISIBLE,
        query.category ? { category: { slug: query.category, active: true } } : {},
        query.featured ? { featured: true } : {},
        searchWhere(query.q),
      ],
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: SORTS[query.sort ?? 'new'],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: 'asc' }, take: 1, select: { url: true, alt: true } },
        },
      }),
    ]);

    return {
      items: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        summary: p.summary,
        price: money(p.price),
        compareAtPrice: money(p.compareAtPrice),
        unit: p.unit,
        featured: p.featured,
        // Kesin stok adedi paylaşılmaz; yalnızca satılabilir mi
        inStock: !p.trackStock || p.stock > 0,
        image: p.images[0] ?? null,
        category: p.category,
      })),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findPublicBySlug(slug: string) {
    const p = await this.prisma.product.findFirst({
      where: { AND: [VISIBLE, { slug }] },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { order: 'asc' }, select: { url: true, alt: true } },
        tabs: { orderBy: { order: 'asc' }, select: { title: true, body: true } },
      },
    });
    if (!p) throw new NotFoundException('Ürün bulunamadı.');

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      summary: p.summary,
      description: p.description,
      price: money(p.price),
      compareAtPrice: money(p.compareAtPrice),
      unit: p.unit,
      featured: p.featured,
      inStock: !p.trackStock || p.stock > 0,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      category: p.category,
      images: p.images,
      tabs: p.tabs,
    };
  }

  // ───────────── Admin ─────────────

  async findAll(query: AdminProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const statusWhere: Prisma.ProductWhereInput =
      query.status === 'active'
        ? { active: true }
        : query.status === 'inactive'
          ? { active: false }
          : query.status === 'low-stock'
            ? { trackStock: true, stock: { lt: LOW_STOCK_THRESHOLD } }
            : {};
    const where: Prisma.ProductWhereInput = {
      AND: [
        searchWhere(query.q),
        query.category === 'none' ? { categoryId: null } : query.category ? { categoryId: query.category } : {},
        statusWhere,
      ],
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { order: 'asc' }, take: 1, select: { url: true, alt: true } },
        },
      }),
    ]);

    return {
      // Liste ekranı için uzun açıklama gönderilmez
      items: products.map(({ images, description: _description, ...p }) => ({
        ...p,
        price: money(p.price),
        compareAtPrice: money(p.compareAtPrice),
        image: images[0] ?? null,
        lowStock: p.trackStock && p.stock < LOW_STOCK_THRESHOLD,
      })),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { order: 'asc' }, select: { url: true, alt: true } },
        tabs: { orderBy: { order: 'asc' }, select: { title: true, body: true } },
      },
    });
    if (!p) throw new NotFoundException('Ürün bulunamadı.');
    return { ...p, price: money(p.price), compareAtPrice: money(p.compareAtPrice) };
  }

  async create(dto: CreateProductDto) {
    if ((await this.prisma.product.count()) >= MAX_PRODUCTS) {
      throw new BadRequestException(`En fazla ${MAX_PRODUCTS} ürün oluşturulabilir.`);
    }
    assertComparePrice(dto.price, dto.compareAtPrice);
    await this.assertCategory(dto.categoryId);

    try {
      const created = await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug,
          sku: dto.sku ?? null,
          summary: dto.summary ?? null,
          description: dto.description ?? null,
          price: dto.price.toFixed(2),
          compareAtPrice: dto.compareAtPrice == null ? null : dto.compareAtPrice.toFixed(2),
          unit: dto.unit ?? null,
          stock: dto.stock ?? 0,
          trackStock: dto.trackStock ?? true,
          active: dto.active ?? true,
          featured: dto.featured ?? false,
          categoryId: dto.categoryId ?? null,
          metaTitle: dto.metaTitle ?? null,
          metaDescription: dto.metaDescription ?? null,
          images: { create: imageRows(dto.images) },
          tabs: { create: tabRows(dto.tabs) },
        },
        select: { id: true },
      });
      return this.findOne(created.id);
    } catch (error) {
      throw mapError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { price: true, compareAtPrice: true },
    });
    if (!existing) throw new NotFoundException('Ürün bulunamadı.');

    // Yeni değer gelmediyse mevcut değerle karşılaştır
    const price = dto.price ?? Number(existing.price.toFixed(2));
    const compareAtPrice =
      dto.compareAtPrice !== undefined
        ? dto.compareAtPrice
        : existing.compareAtPrice == null
          ? null
          : Number(existing.compareAtPrice.toFixed(2));
    assertComparePrice(price, compareAtPrice);
    if (dto.categoryId !== undefined) await this.assertCategory(dto.categoryId);

    const { images, tabs, price: newPrice, compareAtPrice: newCompare, name, ...rest } = dto;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            ...rest,
            ...(name ? { name: name.trim() } : {}),
            ...(newPrice !== undefined ? { price: newPrice.toFixed(2) } : {}),
            ...(newCompare !== undefined
              ? { compareAtPrice: newCompare == null ? null : newCompare.toFixed(2) }
              : {}),
          },
        });
        if (images) {
          await tx.productImage.deleteMany({ where: { productId: id } });
          await tx.productImage.createMany({
            data: imageRows(images).map((row) => ({ ...row, productId: id })),
          });
        }
        if (tabs) {
          await tx.productTab.deleteMany({ where: { productId: id } });
          await tx.productTab.createMany({
            data: tabRows(tabs).map((row) => ({ ...row, productId: id })),
          });
        }
      });
    } catch (error) {
      throw mapError(error);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const found = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Ürün bulunamadı.');
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private async assertCategory(categoryId: string | null | undefined) {
    if (!categoryId) return;
    const found = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!found) throw new BadRequestException('Seçilen kategori bulunamadı.');
  }
}

function assertComparePrice(price: number, compareAtPrice: number | null | undefined) {
  if (compareAtPrice != null && compareAtPrice <= price) {
    throw new BadRequestException('Eski fiyat (üstü çizili), satış fiyatından yüksek olmalıdır.');
  }
}

function imageRows(images: ProductImageDto[] = []) {
  return images.map((image, order) => ({ url: image.url, alt: image.alt?.trim() || null, order }));
}

function tabRows(tabs: ProductTabDto[] = []) {
  return tabs.map((tab, order) => ({ title: tab.title.trim(), body: tab.body, order }));
}

function mapError(error: unknown) {
  if (isUniqueViolation(error)) {
    const target = JSON.stringify(error.meta?.target ?? '');
    return new ConflictException(
      target.includes('sku')
        ? 'Bu stok kodu başka bir üründe kullanılıyor.'
        : 'Bu adres (slug) başka bir üründe kullanılıyor.',
    );
  }
  return error;
}
