import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { SectionsService } from './sections.service.js';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { CreateSectionItemDto } from './dto/create-section-item.dto.js';
import { UpdateSectionItemDto } from './dto/update-section-item.dto.js';

// Tüm uçlar: geçerli JWT + ADMIN rolü zorunlu (sınıf seviyesinde)
@Controller('admin/sections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  // GET /admin/sections            → ana sayfa bölümleri
  // GET /admin/sections?pageId=... → o sayfanın bölümleri
  @Get()
  findAll(
    @Query('pageId', new ParseUUIDPipe({ optional: true })) pageId?: string,
  ) {
    return this.sectionsService.findAllForAdmin(pageId ?? null);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sectionsService.findOneForAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.sectionsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sectionsService.remove(id);
  }

  // ───── Kartlar: /admin/sections/:sectionId/items ─────

  @Post(':sectionId/items')
  createItem(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Body() dto: CreateSectionItemDto,
  ) {
    return this.sectionsService.createItem(sectionId, dto);
  }

  @Patch(':sectionId/items/:itemId')
  updateItem(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateSectionItemDto,
  ) {
    return this.sectionsService.updateItem(sectionId, itemId, dto);
  }

  @Delete(':sectionId/items/:itemId')
  removeItem(
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ) {
    return this.sectionsService.removeItem(sectionId, itemId);
  }
}
