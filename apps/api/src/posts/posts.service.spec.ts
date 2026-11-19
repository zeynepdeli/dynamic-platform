import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { toPositiveInt } from './posts.controller.js';
import { PostsService } from './posts.service.js';

const ctx = { locale: 'tr' as const, defaultLocale: 'tr' as const, locales: ['tr', 'en'] as ('tr' | 'en')[] };
const enCtx = { ...ctx, locale: 'en' as const };

function setup() {
  const prisma = {
    post: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => data),
      update: vi.fn().mockImplementation(({ data }) => data),
      delete: vi.fn(),
    },
  };
  const i18n = { config: vi.fn().mockResolvedValue({ defaultLocale: 'tr', locales: ['tr', 'en'] }) };
  const service = new PostsService(prisma as never, i18n as never);
  return { prisma, service };
}

const errorsOf = async (cls: new () => object, body: object) =>
  (await validate(plainToInstance(cls, body), { whitelist: true, forbidNonWhitelisted: true })).map((e) => e.property);

describe('PostsService', () => {
  let s: ReturnType<typeof setup>;
  beforeEach(() => {
    s = setup();
  });

  it('public liste yalnızca yayında ve tarihi gelmiş yazıları ister; sayfa boyutu sınırlı', async () => {
    await s.service.findPublic(ctx, 2, 999);
    const args = s.prisma.post.findMany.mock.calls[0][0];
    expect(args.where.published).toBe(true);
    expect(args.where.publishedAt.lte).toBeInstanceOf(Date);
    expect(args.take).toBe(50);
    expect(args.skip).toBe(50);
    expect(args.select.content).toBeUndefined();
  });

  it('negatif sayfa 1 sayılır', async () => {
    const res = await s.service.findPublic(ctx, -3, 10);
    expect(res.page).toBe(1);
    expect(s.prisma.post.findMany.mock.calls[0][0].skip).toBe(0);
  });

  it('EN adresiyle yazı bulunur; çeviriler dışarı çıkmaz, alternates /blog önekli', async () => {
    s.prisma.post.findMany.mockResolvedValue([
      { slug: 'merhaba', title: 'Merhaba', translations: { en: { slug: 'hello', title: 'Hello' } } },
    ]);
    const post = await s.service.findPublicBySlug('hello', enCtx);
    expect(post.title).toBe('Hello');
    expect(post.slug).toBe('hello');
    expect(post).not.toHaveProperty('translations');
    expect(post.alternates).toEqual({ tr: '/blog/merhaba', en: '/en/blog/hello' });
  });

  it('ana dil adresi EN altında bulunmaz (çevirisi varsa)', async () => {
    s.prisma.post.findMany.mockResolvedValue([
      { slug: 'merhaba', title: 'Merhaba', translations: { en: { slug: 'hello' } } },
    ]);
    await expect(s.service.findPublicBySlug('merhaba', enCtx)).rejects.toThrow('Yazı bulunamadı.');
  });

  it('yayında oluşturulan yazıya tarih atanır; taslakta atanmaz', async () => {
    const pub = await s.service.create({ title: 'A', slug: 'a', published: true });
    expect(pub?.publishedAt).toBeInstanceOf(Date);
    const draft = await s.service.create({ title: 'B', slug: 'b' });
    expect(draft?.publishedAt).toBeNull();
  });

  it('taslak yayına alınınca tarih atanır; mevcut tarih korunur', async () => {
    s.prisma.post.findUnique.mockResolvedValue({ id: '1', slug: 'a', published: false, publishedAt: null, translations: {} });
    const res = await s.service.update('1', { published: true });
    expect(res?.publishedAt).toBeInstanceOf(Date);

    const when = new Date('2026-01-01T00:00:00Z');
    s.prisma.post.findUnique.mockResolvedValue({ id: '1', slug: 'a', published: false, publishedAt: when, translations: {} });
    const res2 = await s.service.update('1', { published: true });
    expect(res2).not.toHaveProperty('publishedAt');
  });

  it('başka yazının EN adresiyle çakışan slug reddedilir', async () => {
    s.prisma.post.findMany.mockResolvedValue([{ slug: 'x', translations: { en: { slug: 'hello' } } }]);
    await expect(
      s.service.create({ title: 'A', slug: 'a', translations: { en: { slug: 'hello' } } }),
    ).rejects.toThrow('EN adresi');
  });

  it('DTO: zorunlu alan null olamaz, tarih ve görsel denetlenir, bilinmeyen dil reddedilir', async () => {
    expect(await errorsOf(UpdatePostDto, { title: null })).toContain('title');
    expect(await errorsOf(UpdatePostDto, { published: null })).toContain('published');
    expect(await errorsOf(UpdatePostDto, { publishedAt: 'yarın' })).toContain('publishedAt');
    expect(await errorsOf(UpdatePostDto, { publishedAt: null })).toEqual([]);
    expect(await errorsOf(CreatePostDto, { title: 'A', slug: 'Kötü Slug' })).toContain('slug');
    expect(await errorsOf(CreatePostDto, { title: 'A', slug: 'a', coverImageUrl: 'javascript:alert(1)' })).toContain('coverImageUrl');
    expect(await errorsOf(CreatePostDto, { title: 'A', slug: 'a', translations: { de: { title: 'x' } } })).toContain('translations');
    expect(await errorsOf(CreatePostDto, { title: 'A', slug: 'a', category: 'a\nb' })).toContain('category');
  });

  it('sayfa parametresi: geçersiz değer varsayılana döner', () => {
    expect(toPositiveInt('3', 1)).toBe(3);
    expect(toPositiveInt('abc', 1)).toBe(1);
    expect(toPositiveInt('0', 1)).toBe(1);
    expect(toPositiveInt('-2', 1)).toBe(1);
    expect(toPositiveInt('1e3', 12)).toBe(12);
    expect(toPositiveInt(undefined, 12)).toBe(12);
    expect(toPositiveInt(['2'], 1)).toBe(1);
  });
});
