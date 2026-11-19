import { Controller, Get, Query } from '@nestjs/common';

import { I18nService } from '../i18n/i18n.service.js';
import { LangPipe } from '../i18n/lang.pipe.js';

import { MenuItemsService } from './menu-items.service.js';

@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  async findPublic(@Query('lang', LangPipe) lang?: string) {
    return this.menuItemsService.findPublic(await this.i18n.context(lang));
  }
}
