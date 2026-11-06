import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { MenuItemsService } from './menu-items.service.js';
import { MenuItemsController } from './menu-items.controller.js';
import { AdminMenuItemsController } from './admin-menu-items.controller.js';

@Module({
  imports: [AuthModule],

  controllers: [MenuItemsController, AdminMenuItemsController],

  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
