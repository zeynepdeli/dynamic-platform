import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module.js';

import { MediaController } from './media.controller.js';
import { AdminMediaController } from './admin-media.controller.js';

import { MediaService } from './media.service.js';
import { MediaFileValidatorService } from './media-file-validator.service.js';
import { MEDIA_STORAGE } from './storage/media-storage.js';
import { LocalMediaStorage } from './storage/local-media.storage.js';
import { CloudinaryMediaStorage } from './storage/cloudinary-media.storage.js';

@Module({
  imports: [AuthModule],
  controllers: [MediaController, AdminMediaController],
  exports: [MediaService],
  providers: [
    MediaService,
    MediaFileValidatorService,
    {
      // .env → MEDIA_STORAGE=local | cloudinary
      provide: MEDIA_STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<string>('MEDIA_STORAGE') === 'cloudinary'
          ? new CloudinaryMediaStorage({
              cloudName: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
              apiKey: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
              apiSecret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
              folder: config.get<string>('CLOUDINARY_FOLDER') ?? 'dynamic-platform',
            })
          : new LocalMediaStorage(),
    },
  ],
})
export class MediaModule {}
