import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { MediaFileValidatorService } from './media-file-validator.service.js';
import { MEDIA_STORAGE, type MediaStorage } from './storage/media-storage.js';

export type MediaUploadInput = {
  originalName: string;
  buffer: Buffer;
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileValidator: MediaFileValidatorService,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStorage,
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
    const [settings, footers, pages, slides, sections, items] =
      await Promise.all([
      this.prisma.siteSettings.findMany({
        select: {
          logoUrl: true,
          faviconUrl: true,
          backgroundImage: true,
          homeBackgroundImage: true,
          headerBackgroundImage: true,
          ogImageUrl: true,
        },
      }),
      this.prisma.footerSettings.findMany({
        select: { backgroundImage: true },
      }),
      this.prisma.page.findMany({
        where: {
          OR: [
            { ogImageUrl: { not: null } },
            { backgroundImage: { not: null } },
          ],
        },
        select: { ogImageUrl: true, backgroundImage: true },
      }),
      this.prisma.heroSlide.findMany({
        select: { imageUrl: true, mobileImageUrl: true },
      }),
      this.prisma.section.findMany({
        where: { backgroundImage: { not: null } },
        select: { backgroundImage: true },
      }),
      this.prisma.sectionItem.findMany({
        where: {
          OR: [
            { imageUrl: { not: null } },
            { backgroundImage: { not: null } },
          ],
        },
        select: { imageUrl: true, backgroundImage: true },
      }),
    ]);

    const urls = [
      ...settings.flatMap((s) => [
        s.logoUrl,
        s.faviconUrl,
        s.backgroundImage,
        s.homeBackgroundImage,
        s.headerBackgroundImage,
        s.ogImageUrl,
      ]),
      ...footers.map((f) => f.backgroundImage),
      ...pages.flatMap((p) => [p.ogImageUrl, p.backgroundImage]),
      ...slides.flatMap((s) => [s.imageUrl, s.mobileImageUrl]),
      ...sections.map((s) => s.backgroundImage),
      ...items.flatMap((i) => [i.imageUrl, i.backgroundImage]),
    ];

    return new Set(
      // Yerel (/media/...) ve Cloudinary adresleri
      urls.filter((url): url is string => !!url),
    );
  }

  async upload(input: MediaUploadInput) {
    const validated = await this.fileValidator.validate(input.buffer);

    const { storageKey, url } = await this.storage.save({
      id: randomUUID(),
      extension: validated.extension,
      buffer: validated.buffer,
      mimeType: validated.mimeType,
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
      // Kayıt oluşmadıysa yüklenen dosyayı geri al
      await this.storage.remove(storageKey).catch((cleanupError: unknown) =>
        this.logger.error(
          `Yükleme başarısız oldu ve dosya temizlenemedi: ${storageKey}`,
          cleanupError instanceof Error ? cleanupError.stack : String(cleanupError),
        ),
      );
      throw error;
    }
  }

  /** Görsel açıklaması (alt metni) */
  async updateAlt(id: string, alt: string | null) {
    const media = await this.prisma.media.findUnique({ where: { id }, select: { id: true } });
    if (!media) throw new NotFoundException('Medya dosyası bulunamadı.');
    return this.prisma.media.update({ where: { id }, data: { alt: alt?.trim() || null } });
  }

  /** Sitede görselin açıklamasını bulmak için adres → alt eşlemesi */
  async findAltMap(): Promise<Record<string, string>> {
    const rows = await this.prisma.media.findMany({
      where: { alt: { not: null } },
      select: { url: true, alt: true },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });
    return Object.fromEntries(rows.map((r) => [r.url, r.alt as string]));
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
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

    // Önce kayıt: dosya silinemezse sitede kırık kayıt kalmaz, yalnızca
    // sahipsiz bir dosya kalır (loglanır).
    await this.prisma.media.delete({ where: { id } });
    try {
      await this.storage.remove(media.storageKey);
    } catch (error) {
      this.logger.error(
        `Medya kaydı silindi ama dosya silinemedi: ${media.storageKey}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return { id: media.id, deleted: true };
  }
}
