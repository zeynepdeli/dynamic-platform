import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';

import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import { join } from 'node:path';

import type { Response } from 'express';

import { PrismaService } from '../prisma/prisma.service.js';

@Controller('media')
export class MediaController {
  private readonly storageDirectory = join(process.cwd(), 'storage', 'media');

  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

  constructor(private readonly prisma: PrismaService) {}

  @Get(':storageKey')
  async serve(
    @Param('storageKey') storageKey: string,
    @Res() response: Response,
  ) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(
        storageKey,
      )
    ) {
      throw new NotFoundException('Medya dosyası bulunamadı.');
    }

    const media = await this.prisma.media.findUnique({
      where: { storageKey },
    });

    if (!media || !this.allowedMimeTypes.has(media.mimeType)) {
      throw new NotFoundException('Medya dosyası bulunamadı.');
    }

    const filePath = join(this.storageDirectory, storageKey);

    let fileHandle;

    try {
      fileHandle = await open(
        filePath,
        constants.O_RDONLY | constants.O_NOFOLLOW,
      );

      const fileStats = await fileHandle.stat();

      if (!fileStats.isFile()) {
        throw new Error('Geçersiz dosya türü.');
      }
    } catch {
      await fileHandle?.close().catch(() => undefined);

      throw new NotFoundException('Medya dosyası bulunamadı.');
    }

    response.setHeader('Content-Type', media.mimeType);
    response.setHeader('Content-Disposition', 'inline');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'public, max-age=3600');

    const stream = fileHandle.createReadStream({
      autoClose: true,
    });

    stream.on('error', () => {
      if (!response.headersSent) {
        response.status(404).json({
          message: 'Medya dosyası bulunamadı.',
          statusCode: 404,
        });
      } else {
        response.destroy();
      }
    });

    stream.pipe(response);
  }
}
