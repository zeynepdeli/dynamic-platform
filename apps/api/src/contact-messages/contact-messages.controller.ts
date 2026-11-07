import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { ContactMessagesService } from './contact-messages.service.js';
import {
  CreateContactMessageDto,
  UpdateContactMessageDto,
} from './dto/contact-message.dto.js';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactMessagesService) {}

  // Spam koruması: IP başına dakikada 3, saatte 10 mesaj
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({
    default: { limit: 3, ttl: 60_000 },
    long: { limit: 10, ttl: 3_600_000 },
  })
  create(@Body() dto: CreateContactMessageDto) {
    return this.service.create(dto);
  }
}

@Controller('admin/contact-messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminContactMessagesController {
  constructor(private readonly service: ContactMessagesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('unread-count')
  unreadCount() {
    return this.service.unreadCount();
  }

  @Patch(':id')
  setRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactMessageDto,
  ) {
    return this.service.setRead(id, dto.read);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
