import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service.js';
import { MenuItemsService } from './menu-items.service.js';

describe('MenuItemsService', () => {
  let service: MenuItemsService;

  const prisma = {
    $transaction: vi.fn(),
    menuItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(MenuItemsService);
  });

  it('alt menünün altına öğe eklenemez (en fazla 2 seviye)', async () => {
    prisma.menuItem.findUnique.mockResolvedValue({
      id: 'child',
      parentId: 'root',
    });

    await expect(
      service.create({ label: 'X', href: '/x', parentId: 'child' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.menuItem.create).not.toHaveBeenCalled();
  });

  it('yeni öğe aynı seviyenin sonuna eklenir', async () => {
    prisma.menuItem.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);
    prisma.menuItem.create.mockResolvedValue({});

    await service.create({ label: 'X', href: '/x' });

    expect(prisma.menuItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ order: 3, parentId: null }),
    });
  });

  it('sıralamaya başka seviyenin öğesi eklenemez', async () => {
    prisma.menuItem.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

    await expect(
      service.reorder(null, ['a', 'child-x']),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
