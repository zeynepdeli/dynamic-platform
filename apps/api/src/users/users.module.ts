import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { MailController } from '../mail/mail.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, MailController],
  providers: [UsersService],
})
export class UsersModule {}
