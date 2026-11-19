import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { AdminPostsController } from './admin-posts.controller.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PostsController, AdminPostsController],
  providers: [PostsService],
})
export class PostsModule {}
