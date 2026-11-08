import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAdmins();
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto) {
    return this.users.create(dto.email, dto.password);
  }

  @Patch(':id')
  setActive(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminUserDto) {
    return this.users.setActive((req.user as { id: string }).id, id, dto.active);
  }
}
