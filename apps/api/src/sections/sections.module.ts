import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { SectionsController } from './sections.controller.js';
import { AdminSectionsController } from './admin-sections.controller.js';
import { SectionsService } from './sections.service.js';

@Module({
  imports: [AuthModule],
  controllers: [SectionsController, AdminSectionsController],
  providers: [SectionsService],
  exports: [SectionsService], // site-bootstrap'te kullanacağız
})
export class SectionsModule {}
