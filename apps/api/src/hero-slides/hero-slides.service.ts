import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type { CreateHeroSlideDto } from './dto/create-hero-slide.dto.js';
import type { UpdateHeroSlideDto } from './dto/update-hero-slide.dto.js';

@Injectable()
export class HeroSlidesService {
  constructor(private readonly prisma: PrismaService) {}

  // Ziyaretçilere yalnızca aktif sliderları göster.
  async findPublic() {
    return this.prisma.heroSlide.findMany({
      where: {
        active: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  // Admin panelinde tüm sliderları listele.
  async findAll() {
    return this.prisma.heroSlide.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  // Yeni slider oluştur.
  async create(dto: CreateHeroSlideDto) {
    return this.prisma.heroSlide.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description,
        imageUrl: dto.imageUrl,
        mobileImageUrl: dto.mobileImageUrl,
        buttonText: dto.buttonText,
        buttonHref: dto.buttonHref,
        order: dto.order ?? 0,
        active: dto.active ?? true,
      },
    });
  }

  // Slider bilgilerini güncelle.
  async update(id: string, dto: UpdateHeroSlideDto) {
    await this.ensureExists(id);

    return this.prisma.heroSlide.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  // Slider sil.
  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.heroSlide.delete({
      where: {
        id,
      },
    });
  }

  // İşlem yapılacak sliderın varlığını kontrol et.
  private async ensureExists(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({
      where: {
        id,
      },
    });

    if (!slide) {
      throw new NotFoundException('Slider bulunamadı.');
    }

    return slide;
  }
}
