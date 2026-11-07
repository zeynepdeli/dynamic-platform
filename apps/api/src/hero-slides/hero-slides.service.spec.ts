import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service.js';
import { HeroSlidesService } from './hero-slides.service.js';

describe('HeroSlidesService', () => {
  let service: HeroSlidesService;
  const prisma = { heroSlide: { count: vi.fn(), create: vi.fn() } };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroSlidesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(HeroSlidesService);
  });

  it('en fazla 5 slayt eklenebilir', async () => {
    prisma.heroSlide.count.mockResolvedValue(5);
    await expect(service.create({ title: 'Altıncı' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.heroSlide.create).not.toHaveBeenCalled();
  });

  it('yeni slayt sona eklenir', async () => {
    prisma.heroSlide.count.mockResolvedValue(2);
    prisma.heroSlide.create.mockResolvedValue({});
    await service.create({ title: 'Üçüncü' });
    expect(prisma.heroSlide.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ order: 2 }),
    });
  });
});
