import {
  ConflictException,
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

  // En fazla bu kadar kayıt döner (yanıt boyutu / DoS sınırı)
  private static readonly LIST_LIMIT = 500;

  async findAll() {
    const [items, usedUrls] = await Promise.all([
      this.prisma.media.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: MediaService.LIST_LIMIT,
      }),
      this.findUsedUrls(),
    ]);

    return items.map((item) => ({ ...item, inUse: usedUrls.has(item.url) }));
  }

  /**
   * Sitede herhangi bir yerde kullanılan /media/... adresleri.
   * Yeni bir görsel alanı eklendiğinde buraya da eklenmeli; aksi halde
   * kullanımdaki bir görsel silinebilir.
   */
  async findUsedUrls(): Promise<Set<string>> {
    const [settings, pages, slides, sections, items] = await Promise.all([
      this.prisma.siteSettings.findMany({
        select: { logoUrl: true, faviconUrl: true, backgroundImage: true },
      }),
      this.prisma.page.findMany({
        where: { ogImageUrl: { not: null } },
        select: { ogImageUrl: true },
      }),
      this.prisma.heroSlide.findMany({
        select: { imageUrl: true, mobileImageUrl: true },
      }),
      this.prisma.section.findMany({
        where: { backgroundImage: { not: null } },
        select: { backgroundImage: true },
      }),
      this.prisma.sectionItem.findMany({
        where: { imageUrl: { not: null } },
        select: { imageUrl: true },
      }),
    ]);

    const urls = [
      ...settings.flatMap((s) => [s.logoUrl, s.faviconUrl, s.backgroundImage]),
      ...pages.map((p) => p.ogImageUrl),
      ...slides.flatMap((s) => [s.imageUrl, s.mobileImageUrl]),
      ...sections.map((s) => s.backgroundImage),
      ...items.map((i) => i.imageUrl),
    ];

    return new Set(
      urls.filter((url): url is string => !!url && url.startsWith('/media/')),
    );
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

    // Kullanımdaki görsel silinirse sitede kırık görsel oluşur
    const usedUrls = await this.findUsedUrls();
    if (usedUrls.has(media.url)) {
      throw new ConflictException(
        'Bu görsel sitede kullanılıyor. Önce kullanıldığı yerden kaldırın.',
      );
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
