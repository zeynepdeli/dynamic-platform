import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { PrismaService } from '../prisma/prisma.service.js';
import { MediaFileValidatorService } from './media-file-validator.service.js';

export type MediaUploadInput = {
  originalName: string;
  buffer: Buffer;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  private readonly storageDirectory = join(process.cwd(), 'storage', 'media');

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileValidator: MediaFileValidatorService,
  ) {}

  async findAll() {
    return this.prisma.media.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async upload(input: MediaUploadInput) {
    const validated = await this.fileValidator.validate(input.buffer);

    const storageKey = `${randomUUID()}.${validated.extension}`;
    const filePath = join(this.storageDirectory, storageKey);
    const url = `/media/${storageKey}`;

    await mkdir(this.storageDirectory, {
      recursive: true,
    });

    await writeFile(filePath, validated.buffer, {
      flag: 'wx',
      mode: 0o600,
    });

    try {
      return await this.prisma.media.create({
        data: {
          originalName: input.originalName.slice(0, 255),
          storageKey,
          mimeType: validated.mimeType,
          size: validated.size,
          url,
        },
      });
    } catch (error) {
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        this.logger.error(
          `Yükleme başarısız oldu ve medya dosyası temizlenemedi: ${storageKey}`,
          cleanupError instanceof Error
            ? cleanupError.stack
            : String(cleanupError),
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Medya dosyası bulunamadı.');
    }

    const filePath = join(this.storageDirectory, media.storageKey);
    const temporaryPath = `${filePath}.${randomUUID()}.deleting`;

    let fileMoved = false;

    try {
      await rename(filePath, temporaryPath);
      fileMoved = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    try {
      await this.prisma.media.delete({
        where: { id },
      });
    } catch (error) {
      if (fileMoved) {
        try {
          await rename(temporaryPath, filePath);
        } catch (restoreError) {
          this.logger.error(
            `Medya dosyası geri yüklenemedi. Medya ID: ${id}. Geçici dosya: ${temporaryPath}`,
            restoreError instanceof Error
              ? restoreError.stack
              : String(restoreError),
          );

          throw new InternalServerErrorException(
            'Medya silme işlemi başarısız oldu ve dosya geri yüklenemedi.',
          );
        }
      }

      throw error;
    }

    if (fileMoved) {
      try {
        await unlink(temporaryPath);
      } catch (error) {
        this.logger.error(
          `Medya veritabanından silindi ancak geçici dosya temizlenemedi: ${temporaryPath}`,
          error instanceof Error ? error.stack : String(error),
        );

        throw new InternalServerErrorException(
          'Medya kaydı silindi ancak dosya temizleme işlemi tamamlanamadı.',
        );
      }
    }

    return {
      id: media.id,
      deleted: true,
    };
  }
}
