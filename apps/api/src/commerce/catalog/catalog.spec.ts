import { BadRequestException, ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { CategoriesService } from './categories.service.js';
import { PublicProductQueryDto } from './dto/catalog-query.dto.js';
import { CreateProductDto } from './dto/product.dto.js';
import { ProductsService } from './products.service.js';

const errorsOf = async (cls: new () => object, body: object) =>
  (await validate(plainToInstance(cls, body), { whitelist: true, forbidNonWhitelisted: true })).map(
    (e) => e.property,
  );

const validProduct = { name: 'Tulum Peyniri', slug: 'tulum-peyniri', price: 249.9 };

describe('Ürün DTO doğrulaması', () => {
  it('geçerli ürün kabul edilir', async () => {
    expect(await errorsOf(CreateProductDto, { ...validProduct, images: [{ url: '/media/1b4e28ba-2fa1-11d2-883f-0016d3cca427.jpg' }] })).toEqual([]);
  });

  it('negatif, 2 ondalıktan fazla veya metin fiyat reddedilir', async () => {
    for (const price of [-1, 10.999, '100', Number.NaN]) {
      expect(await errorsOf(CreateProductDto, { ...validProduct, price })).toContain('price');
    }
  });

  it('javascript:/http görsel ve satır sonlu ad reddedilir', async () => {
    expect(await errorsOf(CreateProductDto, { ...validProduct, images: [{ url: 'javascript:alert(1)' }] })).toContain('images');
    expect(await errorsOf(CreateProductDto, { ...validProduct, images: [{ url: 'http://x.com/a.jpg' }] })).toContain('images');
    expect(await errorsOf(CreateProductDto, { ...validProduct, name: 'Ad\r\nBcc: x' })).toContain('name');
  });

  it('bilinmeyen alan (ör. stok dışı alan, iç içe) reddedilir — mass assignment', async () => {
    expect(await errorsOf(CreateProductDto, { ...validProduct, id: 'x' })).toContain('id');
    expect(await errorsOf(CreateProductDto, { ...validProduct, tabs: [{ title: 'A', body: 'B', productId: 'x' }] })).toContain('tabs');
  });

  it('en fazla 12 görsel', async () => {
    const images = Array.from({ length: 13 }, () => ({ url: 'https://cdn.example.com/a.jpg' }));
    expect(await errorsOf(CreateProductDto, { ...validProduct, images })).toContain('images');
  });

  it('liste limiti 48 ile sınırlı, slug dışı kategori reddedilir', async () => {
    expect(await errorsOf(PublicProductQueryDto, { limit: '500' })).toContain('limit');
    expect(await errorsOf(PublicProductQueryDto, { category: "a' OR 1=1" })).toContain('category');
    expect(await errorsOf(PublicProductQueryDto, { limit: '24', page: '2', sort: 'price-asc' })).toEqual([]);
  });
});

describe('ProductsService', () => {
  const prisma = {
    product: { count: vi.fn(), create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    productCategory: { findUnique: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const service = new ProductsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.product.count.mockResolvedValue(0);
  });

  it('eski fiyat satış fiyatından düşükse reddedilir', async () => {
    await expect(service.create({ ...validProduct, compareAtPrice: 100 })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('olmayan kategori reddedilir', async () => {
    prisma.productCategory.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ ...validProduct, categoryId: '1b4e28ba-2fa1-11d2-883f-0016d3cca427' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('aynı slug 409 döner', async () => {
    prisma.product.create.mockRejectedValue({ code: 'P2002', meta: { target: ['slug'] } });
    await expect(service.create(validProduct)).rejects.toBeInstanceOf(ConflictException);
  });

  it('fiyat 2 basamağa sabitlenir, görseller sırayla kaydedilir', async () => {
    prisma.product.create.mockResolvedValue({ id: 'p1' });
    prisma.product.findUnique.mockResolvedValue({ id: 'p1', price: { toFixed: () => '249.90' }, compareAtPrice: null });
    await service.create({ ...validProduct, images: [{ url: 'https://a.co/1.jpg' }, { url: 'https://a.co/2.jpg', alt: ' Ön ' }] });
    const data = prisma.product.create.mock.calls[0][0].data;
    expect(data.price).toBe('249.90');
    expect(data.images.create).toEqual([
      { url: 'https://a.co/1.jpg', alt: null, order: 0 },
      { url: 'https://a.co/2.jpg', alt: 'Ön', order: 1 },
    ]);
  });

  it('ziyaretçi listesi yalnızca yayındaki ürünleri sorgular ve stok adedini gizler', async () => {
    prisma.product.count.mockResolvedValue(1);
    prisma.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'A', slug: 'a', summary: null, price: { toFixed: () => '10.00' }, compareAtPrice: null, unit: null, featured: false, trackStock: true, stock: 0, images: [], category: null },
    ]);
    const result = await service.findPublic({});
    const where = prisma.product.findMany.mock.calls[0][0].where;
    expect(JSON.stringify(where)).toContain('"active":true');
    expect(result.items[0]).toMatchObject({ inStock: false, price: '10.00' });
    expect(result.items[0]).not.toHaveProperty('stock');
  });
});

describe('CategoriesService', () => {
  const prisma = { productCategory: { findUnique: vi.fn(), delete: vi.fn() } };
  const service = new CategoriesService(prisma as unknown as PrismaService);

  it('içinde ürün olan kategori silinmez', async () => {
    prisma.productCategory.findUnique.mockResolvedValue({ id: 'c1', _count: { products: 3 } });
    await expect(service.remove('c1')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.productCategory.delete).not.toHaveBeenCalled();
  });
});
