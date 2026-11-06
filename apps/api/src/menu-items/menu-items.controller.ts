import { Controller, Get } from '@nestjs/common';

import { MenuItemsService } from './menu-items.service.js';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  findPublic() {
    return this.menuItemsService.findPublic();
  }
}
