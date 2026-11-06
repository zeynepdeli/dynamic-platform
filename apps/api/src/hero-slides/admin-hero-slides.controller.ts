import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { HeroSlidesService } from './hero-slides.service.js';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto.js';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto.js';

@Controller('admin/hero-slides')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminHeroSlidesController {
  constructor(private readonly heroSlidesService: HeroSlidesService) {}

  // Tüm sliderları listele.
  @Get()
  findAll() {
    return this.heroSlidesService.findAll();
  }

  // Yeni slider oluştur.
  @Post()
  create(@Body() dto: CreateHeroSlideDto) {
    return this.heroSlidesService.create(dto);
  }

  // Mevcut sliderı güncelle.
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroSlideDto,
  ) {
    return this.heroSlidesService.update(id, dto);
  }

  // Slider sil.
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.heroSlidesService.remove(id);
  }
}
