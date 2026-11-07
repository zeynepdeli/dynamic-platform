import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { assertSameIds } from '../common/reorder.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { MenuLocation } from '../generated/prisma/enums.js';

import type { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import type { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';

// Kaynak tüketimini sınırla (OWASP A04)
const MAX_MENU_ITEMS = 100;

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
    const location = dto.location ?? 'HEADER';

    if (dto.parentId) {
      if (location === 'FOOTER') {
        throw new BadRequestException('Footer linkleri tek seviyelidir.');
      }
      const parent = await this.ensureValidParent(dto.parentId);
      if (parent.location !== location) {
        throw new BadRequestException('Üst menü aynı konumda olmalı.');
      }
    }

    const total = await this.prisma.menuItem.count();
    if (total >= MAX_MENU_ITEMS) {
      throw new BadRequestException(
        `En fazla ${MAX_MENU_ITEMS} menü öğesi oluşturulabilir.`,
      );
    }

    // Varsayılan: aynı seviyenin en sonuna ekle
    const siblings = await this.prisma.menuItem.count({
      where: { parentId: dto.parentId ?? null, location },
    });

    return this.prisma.menuItem.create({
      data: {
        label: dto.label,
        href: dto.href,
        icon: dto.icon ?? null,
        order: dto.order ?? siblings,
        visible: dto.visible ?? true,
        parentId: dto.parentId ?? null,
        location,
      },
    });
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.ensureExists(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Bir menü kendi üst menüsü olamaz.');
      }

      if (dto.parentId !== null) {
        if (item.location === 'FOOTER') {
          throw new BadRequestException('Footer linkleri tek seviyelidir.');
        }
        const parent = await this.ensureValidParent(dto.parentId);
        if (parent.location !== item.location) {
          throw new BadRequestException('Üst menü aynı konumda olmalı.');
        }
        await this.ensureNoCycle(id, dto.parentId);

        // Alt menüsü olan bir öğe başka bir öğenin altına taşınamaz
        // (en fazla 2 seviye)
        const childCount = await this.prisma.menuItem.count({
          where: { parentId: id },
        });
        if (childCount > 0) {
          throw new BadRequestException(
            'Alt menüsü olan bir öğe başka bir menünün altına taşınamaz.',
          );
        }
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

  // Aynı konum + aynı üst menünün altındaki öğeleri sırala
  // (parentId = null → üst seviye)
  async reorder(
    location: MenuLocation,
    parentId: string | null,
    ids: string[],
  ) {
    const siblings = await this.prisma.menuItem.findMany({
      where: { parentId, location },
      select: { id: true },
    });

    assertSameIds(
      siblings.map((item) => item.id),
      ids,
    );

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.menuItem.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.findAll();
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

  // Menü en fazla 2 seviyelidir: üst menü kendisi bir alt menü olamaz
  private async ensureValidParent(parentId: string) {
    const parent = await this.ensureExists(parentId);

    if (parent.parentId !== null) {
      throw new BadRequestException(
        'Menü en fazla 2 seviyeli olabilir. Alt menünün altına öğe eklenemez.',
      );
    }

    return parent;
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
