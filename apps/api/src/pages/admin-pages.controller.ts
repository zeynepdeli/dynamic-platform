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

import { PagesService } from './pages.service.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

// Tüm uçlar: geçerli JWT + ADMIN rolü zorunlu.
@Controller('admin/pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  // Aktif (silinmemiş) sayfalar
  @Get()
  findAll() {
    return this.pagesService.findAllForAdmin();
  }

  // Çöp kutusu — ':id' rotasından ÖNCE tanımlanmalı
  @Get('trash')
  findDeleted() {
    return this.pagesService.findDeleted();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pagesService.findOneForAdmin(id);
  }

  @Post()
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, updatePageDto);
  }

  // Soft delete
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pagesService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pagesService.restore(id);
  }
}
