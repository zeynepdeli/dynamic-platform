import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import {
  AdminContactMessagesController,
  ContactController,
} from './contact-messages.controller.js';
import { ContactMessagesService } from './contact-messages.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ContactController, AdminContactMessagesController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}
