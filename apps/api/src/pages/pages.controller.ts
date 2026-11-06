import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PagesService } from './pages.service.js';

import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // PUBLIC: Yayındaki sayfaları listele
  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  // ADMIN: Aktif sayfaları listele
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllForAdmin() {
    return this.pagesService.findAllForAdmin();
  }

  // ADMIN: Çöp kutusundaki sayfaları listele
  @Get('admin/deleted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findDeleted() {
    return this.pagesService.findDeleted();
  }

  // ADMIN: Düzenlenecek sayfanın bilgilerini getir
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOneForAdmin(@Param('id') id: string) {
    return this.pagesService.findOneForAdmin(id);
  }

  // ADMIN: Yeni sayfa oluştur
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  // ADMIN: Mevcut sayfayı güncelle
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  // ADMIN: Sayfayı çöp kutusuna taşı (Soft Delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

  // ADMIN: Çöp kutusundaki sayfayı geri yükle
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  restore(@Param('id') id: string) {
    return this.pagesService.restore(id);
  }
}
