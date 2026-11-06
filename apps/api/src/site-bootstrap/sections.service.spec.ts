import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { SectionsService } from '../sections/sections.service.js';


describe('SectionsService', () => {
  let service: SectionsService;

  const prisma = {
    page: { findFirst: vi.fn() },
    section: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    sectionItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SectionsService);
  });

  describe('IDOR koruması', () => {
    it('kartı her zaman id + sectionId ile arar', async () => {
      prisma.sectionItem.findFirst.mockResolvedValue({ id: 'item-1' });
      prisma.sectionItem.update.mockResolvedValue({});

      await service.updateItem('section-A', 'item-1', { title: 'Yeni' });

      expect(prisma.sectionItem.findFirst).toHaveBeenCalledWith({
        where: { id: 'item-1', sectionId: 'section-A' },
        select: { id: true },
      });
    });

    it('başka bölümün kartını güncelleyemez/silemez (404)', async () => {
      prisma.sectionItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItem('section-A', 'item-of-B', { title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.removeItem('section-A', 'item-of-B'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.sectionItem.update).not.toHaveBeenCalled();
      expect(prisma.sectionItem.delete).not.toHaveBeenCalled();
    });

    it('null başlık güncellemeye yazılmaz', async () => {
      prisma.sectionItem.findFirst.mockResolvedValue({ id: 'item-1' });
      prisma.sectionItem.update.mockResolvedValue({});

      await service.updateItem('section-A', 'item-1', {
        title: null as unknown as string,
        description: null,
      });

      expect(prisma.sectionItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { description: null },
      });
    });
  });

  describe('bölüm oluşturma', () => {
    it('silinmiş/olmayan sayfaya bölüm eklenemez', async () => {
      prisma.page.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ pageId: '0b8f1a52-3c4d-4e5f-8a9b-0c1d2e3f4a5b' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.section.create).not.toHaveBeenCalled();
    });

    it('sayfa başına bölüm limiti aşılamaz', async () => {
      prisma.section.count.mockResolvedValue(50);

      await expect(service.create({})).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.section.create).not.toHaveBeenCalled();
    });
  });

  describe('public sorgular', () => {
    it('sadece aktif bölümleri ve yayındaki sayfayı sorgular', async () => {
      prisma.section.findMany.mockResolvedValue([]);

      await service.findPublicByPageSlug('hakkimizda');

      const args = prisma.section.findMany.mock.calls[0][0];
      expect(args.where).toEqual({
        active: true,
        page: { slug: 'hakkimizda', published: true, deletedAt: null },
      });
      // İç alanlar dışarı sızmamalı
      expect(args.select.pageId).toBeUndefined();
      expect(args.select.createdAt).toBeUndefined();
      expect(args.select.items.where).toEqual({ active: true });
    });
  });
});
