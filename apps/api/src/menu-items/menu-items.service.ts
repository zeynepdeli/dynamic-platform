import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import type { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  // Ziyaretçilere yalnızca görünür menüleri döndürür.

  async findPublic() {
    const items = await this.prisma.menuItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });

    const itemMap = new Map(items.map((item) => [item.id, item]));

    const isVisible = (itemId: string): boolean => {
      const visited = new Set<string>();
      let currentId: string | null = itemId;

      while (currentId !== null) {
        if (visited.has(currentId)) {
          return false;
        }

        visited.add(currentId);

        const item = itemMap.get(currentId);

        if (!item || !item.visible) {
          return false;
        }

        currentId = item.parentId;
      }

      return true;
    };

    return items.filter((item) => isVisible(item.id));
  }

  // Admin tüm menüleri, gizli olanlar dahil, görebilir.
  async findAll() {
    return this.prisma.menuItem.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  async create(dto: CreateMenuItemDto) {
    if (dto.parentId) {
      await this.ensureValidParent(dto.parentId);
    }

    return this.prisma.menuItem.create({
      data: {
        label: dto.label,
        href: dto.href,
        order: dto.order ?? 0,
        visible: dto.visible ?? true,
        parentId: dto.parentId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.ensureExists(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Bir menü kendi üst menüsü olamaz.');
      }

      if (dto.parentId !== null) {
        await this.ensureValidParent(dto.parentId);
        await this.ensureNoCycle(id, dto.parentId);
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    const childrenCount = await this.prisma.menuItem.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Bu menünün alt öğeleri var. Önce alt öğeleri taşıyın veya silin.',
      );
    }

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Menü öğesi bulunamadı.');
    }

    return item;
  }

  private async ensureValidParent(parentId: string) {
    return this.ensureExists(parentId);
  }

  // A -> B -> C gibi bir hiyerarşide A'nın C altına
  // taşınmasını engelleyerek döngü oluşmasını önler.
  private async ensureNoCycle(id: string, parentId: string) {
    const visited = new Set<string>();
    let currentId: string | null = parentId;

    while (currentId !== null) {
      if (currentId === id || visited.has(currentId)) {
        throw new BadRequestException(
          'Menü hiyerarşisinde döngü oluşturulamaz.',
        );
      }

      visited.add(currentId);

      const current: { parentId: string | null } | null =
        await this.prisma.menuItem.findUnique({
          where: { id: currentId },
          select: { parentId: true },
        });

      if (!current) {
        throw new BadRequestException('Menü hiyerarşisi geçersiz.');
      }

      currentId = current.parentId;
    }
  }
}
