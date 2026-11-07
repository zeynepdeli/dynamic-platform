import { ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service.js';
import { MediaFileValidatorService } from './media-file-validator.service.js';
import { MediaService } from './media.service.js';

const USED = '/media/0b8f1a52-3c4d-4e5f-8a9b-0c1d2e3f4a5b.webp';
const PAGE_BG = '/media/2d0a3c74-5e6f-4a71-8cbd-2e3f4a5b6c7d.jpg';
const FREE = '/media/1c9f2b63-4d5e-4f60-9bac-1d2e3f4a5b6c.png';

describe('MediaService', () => {
  let service: MediaService;

  const prisma = {
    media: { findMany: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    siteSettings: { findMany: vi.fn() },
    page: { findMany: vi.fn() },
    heroSlide: { findMany: vi.fn() },
    section: { findMany: vi.fn() },
    sectionItem: { findMany: vi.fn() },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    prisma.siteSettings.findMany.mockResolvedValue([
      { logoUrl: USED, faviconUrl: null, backgroundImage: null },
    ]);
    prisma.page.findMany.mockResolvedValue([
      { ogImageUrl: null, backgroundImage: PAGE_BG },
    ]);
    prisma.heroSlide.findMany.mockResolvedValue([]);
    prisma.section.findMany.mockResolvedValue([]);
    prisma.sectionItem.findMany.mockResolvedValue([
      { imageUrl: 'https://cdn.example.com/x.jpg' },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: MediaFileValidatorService, useValue: {} },
      ],
    }).compile();

    service = module.get(MediaService);
  });

  it('listede kullanımdaki görseller işaretlenir', async () => {
    prisma.media.findMany.mockResolvedValue([
      { id: '1', url: USED },
      { id: '2', url: FREE },
    ]);

    const list = await service.findAll();

    expect(list).toEqual([
      { id: '1', url: USED, inUse: true },
      { id: '2', url: FREE, inUse: false },
    ]);
    expect(prisma.media.findMany.mock.calls[0][0].take).toBe(500);
  });

  it('sayfa arka planı kullanımda sayılır, harici (https) adresler sayılmaz', async () => {
    const urls = await service.findUsedUrls();
    expect([...urls].sort()).toEqual([USED, PAGE_BG].sort());
  });

  it('kullanımdaki görsel silinemez (409)', async () => {
    prisma.media.findUnique.mockResolvedValue({
      id: '1',
      url: USED,
      storageKey: 'x.webp',
    });

    await expect(service.remove('1')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.media.delete).not.toHaveBeenCalled();
  });
});
