import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';
import { AdminPagesController } from './admin-pages.controller.js';

// JWT yapılandırması tek yerde (AuthModule) tutulur; burada tekrar
// JwtModule.register yapılmaz.
@Module({
  imports: [AuthModule],
  controllers: [PagesController, AdminPagesController],
  providers: [PagesService],
})
export class PagesModule {}
