import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { CreateSectionDto } from './dto/create-section.dto.js';
import type { UpdateSectionDto } from './dto/update-section.dto.js';
import type { CreateSectionItemDto } from './dto/create-section-item.dto.js';
import type { UpdateSectionItemDto } from './dto/update-section-item.dto.js';
import { localize, localizeHref, mergeTranslations, TRANSLATABLE } from '../i18n/localize.js';
import { DEFAULT_LOCALE_CONTEXT, type LocaleContext } from '../i18n/i18n.service.js';

// Kaynak tüketimini sınırla (OWASP A04)
const MAX_SECTIONS_PER_PAGE = 50;
const MAX_ITEMS_PER_SECTION = 50;

// Ziyaretçiye dönecek alanlar — iç alanlar (pageId, createdAt...) yok.
const publicItemSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  icon: true,
  subtitle: true,
  rating: true,
  linkUrl: true,
  buttonText: true,
  buttonHref: true,
  backgroundColor: true,
  backgroundImage: true,
} satisfies Prisma.SectionItemSelect;

const publicSectionSelect = {
  id: true,
  key: true,
  type: true,
  title: true,
  subtitle: true,
  body: true,
  backgroundColor: true,
  backgroundImage: true,
  textColor: true,
  buttonText: true,
  buttonHref: true,
  columns: true,
  videoUrl: true,
  mapAddress: true,
  translations: true,
  items: {
    where: { active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { ...publicItemSelect, translations: true },
  },
} satisfies Prisma.SectionSelect;

const sectionOrder = [
  { order: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' },
] satisfies Prisma.SectionOrderByWithRelationInput[];

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────── PUBLIC ─────────────

  // Ana sayfa bölümleri (pageId = null)
  async findPublicHome(ctx: LocaleContext = DEFAULT_LOCALE_CONTEXT) {
    const sections = await this.prisma.section.findMany({
      where: { pageId: null, active: true },
      orderBy: sectionOrder,
      select: publicSectionSelect,
    });
    return sections.map((s) => this.localizeSection(s, ctx));
  }

  // Yayındaki bir sayfanın bölümleri. slug: istenen dildeki adres (ctx.slugMap'teki değerlerden biri).
  async findPublicByPageSlug(slug: string, ctx: LocaleContext = DEFAULT_LOCALE_CONTEXT) {
    // Ana dil dışında: o dildeki adresi ana slug'a çevir (çevirisi yoksa ikisi aynıdır)
    const baseSlug =
      ctx.locale === ctx.defaultLocale ? slug : [...ctx.slugMap].find(([, localized]) => localized === slug)?.[0];
    if (!baseSlug) return [];
    const sections = await this.prisma.section.findMany({
      where: {
        active: true,
        page: { slug: baseSlug, published: true, deletedAt: null },
      },
      orderBy: sectionOrder,
      select: publicSectionSelect,
    });
    return sections.map((s) => this.localizeSection(s, ctx));
  }

  /** Bölüm ve kartlarını istenen dile çevirir; site içi bağlantıları o dilin adreslerine taşır */
  private localizeSection(
    row: Prisma.SectionGetPayload<{ select: typeof publicSectionSelect }>,
    ctx: LocaleContext,
  ) {
    const href = (h: string | null) => localizeHref(h, ctx.locale, ctx.defaultLocale, ctx.slugMap);
    const section = localize(row, ctx.locale, ctx.defaultLocale, TRANSLATABLE.section);
    return {
      ...section,
      buttonHref: href(section.buttonHref),
      items: row.items.map((i) => {
        const item = localize(i, ctx.locale, ctx.defaultLocale, TRANSLATABLE.sectionItem);
        return { ...item, buttonHref: href(item.buttonHref) };
      }),
    };
  }

  // ───────────── ADMIN: BÖLÜMLER ─────────────

  // pageId = null → ana sayfa bölümleri
  async findAllForAdmin(pageId: string | null) {
    return this.prisma.section.findMany({
      where: { pageId },
      orderBy: sectionOrder,
      include: {
        items: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      },
    });
  }

  async findOneForAdmin(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        items: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      },
    });

    if (!section) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }

    return section;
  }

  async create(dto: CreateSectionDto) {
    const pageId = dto.pageId ?? null;

    if (pageId) {
      await this.ensurePageExists(pageId);
    }

    const count = await this.prisma.section.count({ where: { pageId } });
    if (count >= MAX_SECTIONS_PER_PAGE) {
      throw new BadRequestException(
        `Bir sayfada en fazla ${MAX_SECTIONS_PER_PAGE} bölüm olabilir.`,
      );
    }

    if (dto.key) {
      await this.ensureKeyAvailable(pageId, dto.key);
    }

    return this.prisma.section
      .create({
        data: {
          pageId,
          key: dto.key,
          type: dto.type,
          title: dto.title,
          videoUrl: dto.videoUrl ?? null,
          mapAddress: dto.mapAddress?.trim() || null,
          subtitle: dto.subtitle,
          body: dto.body,
          backgroundColor: dto.backgroundColor,
          backgroundImage: dto.backgroundImage,
          textColor: dto.textColor,
          buttonText: dto.buttonText,
          buttonHref: dto.buttonHref,
          columns: dto.columns ?? 3,
          order: dto.order ?? count, // varsayılan: en sona ekle
          active: dto.active ?? true,
          translations: mergeTranslations({}, dto.translations),
        },
      })
      .catch((error: unknown) => this.rethrowKeyConflict(error));
  }

  async update(id: string, dto: UpdateSectionDto) {
    const section = await this.ensureSectionExists(id);

    if (dto.key) {
      await this.ensureKeyAvailable(section.pageId, dto.key, id);
    }

    const { translations, ...rest } = dto;
    return this.prisma.section
      .update({
        where: { id },
        data: { ...rest, translations: mergeTranslations(section.translations, translations) },
      })
      .catch((error: unknown) => this.rethrowKeyConflict(error));
  }

  // Kartlar onDelete: Cascade ile birlikte silinir
  async remove(id: string) {
    await this.ensureSectionExists(id);

    return this.prisma.section.delete({ where: { id } });
  }

  // ───────────── ADMIN: KARTLAR ─────────────

  async createItem(sectionId: string, dto: CreateSectionItemDto) {
    const section = await this.ensureSectionExists(sectionId);
    const title = dto.title?.trim() ?? '';
    this.assertItemContent(section.type, title, dto.imageUrl, dto.description);

    const count = await this.prisma.sectionItem.count({
      where: { sectionId },
    });
    if (count >= MAX_ITEMS_PER_SECTION) {
      throw new BadRequestException(
        `Bir bölümde en fazla ${MAX_ITEMS_PER_SECTION} kart olabilir.`,
      );
    }

    return this.prisma.sectionItem.create({
      data: {
        sectionId, // URL'den gelir, body'den DEĞİL
        title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        icon: dto.icon,
        subtitle: dto.subtitle ?? null,
        rating: dto.rating ?? null,
        linkUrl: dto.linkUrl ?? null,
        buttonText: dto.buttonText,
        buttonHref: dto.buttonHref,
        backgroundColor: dto.backgroundColor,
        backgroundImage: dto.backgroundImage,
        order: dto.order ?? count,
        active: dto.active ?? true,
        translations: mergeTranslations({}, dto.translations),
      },
    });
  }

  async updateItem(
    sectionId: string,
    itemId: string,
    dto: UpdateSectionItemDto,
  ) {
    const current = await this.ensureItemBelongsToSection(sectionId, itemId);
    const section = await this.ensureSectionExists(sectionId);

    // title null gelirse yok say; gönderildiyse türe göre denetle
    const { title, translations, ...rest } = dto;
    if (title != null && section.type !== 'GALLERY' && !title.trim()) {
      throw new BadRequestException('Başlık boş olamaz.');
    }
    if ((section.type === 'GALLERY' || section.type === 'LOGOS') && dto.imageUrl === null) {
      throw new BadRequestException(section.type === 'LOGOS' ? 'Logo öğesinde görsel olmalı.' : 'Galeri öğesinde görsel olmalı.');
    }
    if (section.type === 'TESTIMONIALS' && dto.description !== undefined && !dto.description?.trim()) {
      throw new BadRequestException('Yorum metni boş olamaz.');
    }

    return this.prisma.sectionItem.update({
      where: { id: itemId },
      data: {
        ...rest,
        ...(title != null ? { title: title.trim() } : {}),
        ...(translations ? { translations: mergeTranslations(current.translations, translations) } : {}),
      },
    });
  }

  async removeItem(sectionId: string, itemId: string) {
    await this.ensureItemBelongsToSection(sectionId, itemId);

    return this.prisma.sectionItem.delete({ where: { id: itemId } });
  }

  // ───────────── ADMIN: SIRALAMA ─────────────

  // ids dizisindeki sıra = yeni sıra. Liste, o sayfadaki bölümlerin
  // TAMAMI olmalı: başka sayfanın bölümü araya sokulamaz (IDOR).
  async reorderSections(pageId: string | null, ids: string[]) {
    const existing = await this.prisma.section.findMany({
      where: { pageId },
      select: { id: true },
    });

    this.assertSameIds(
      existing.map((section) => section.id),
      ids,
    );

    // Hepsi ya güncellenir ya hiçbiri (transaction)
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.section.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.findAllForAdmin(pageId);
  }

  async reorderItems(sectionId: string, ids: string[]) {
    await this.ensureSectionExists(sectionId);

    const existing = await this.prisma.sectionItem.findMany({
      where: { sectionId },
      select: { id: true },
    });

    this.assertSameIds(
      existing.map((item) => item.id),
      ids,
    );

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.sectionItem.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.findOneForAdmin(sectionId);
  }

  // ───────────── YARDIMCILAR ─────────────

  // Gönderilen liste, mevcut kayıtlarla birebir aynı küme olmalı
  private assertSameIds(existingIds: string[], ids: string[]) {
    const existing = new Set(existingIds);

    if (ids.length !== existing.size || !ids.every((id) => existing.has(id))) {
      throw new BadRequestException(
        'Sıralama listesi güncel değil. Sayfayı yenileyip tekrar deneyin.',
      );
    }
  }

  private async ensurePageExists(pageId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, deletedAt: null },
      select: { id: true },
    });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }
  }

  private async ensureSectionExists(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      select: { id: true, pageId: true, type: true, translations: true },
    });

    if (!section) {
      throw new NotFoundException('Bölüm bulunamadı.');
    }

    return section;
  }

  // Eşzamanlı iki istek kontrolü aynı anda geçerse veritabanı (P2002)
  // yakalar; 500 yerine anlamlı bir 409 dönülür.
  private rethrowKeyConflict(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Bu anahtar bu sayfada zaten kullanılıyor.');
    }

    throw error;
  }

  // Aynı sayfada aynı anahtar iki kez kullanılamaz.
  // Not: Ana sayfada pageId = NULL olduğu için veritabanındaki
  // @@unique([pageId, key]) bu durumu yakalamaz (SQL'de NULL'lar
  // birbirinden farklı sayılır). Bu yüzden kontrol burada da yapılır.
  private async ensureKeyAvailable(
    pageId: string | null,
    key: string,
    exceptId?: string,
  ) {
    const existing = await this.prisma.section.findFirst({
      where: {
        pageId,
        key,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        `"${key}" anahtarı bu sayfada zaten kullanılıyor.`,
      );
    }
  }

  // IDOR koruması: kart, URL'deki bölüme ait değilse 404
  /** Galeride görsel zorunlu, alt yazı isteğe bağlı; diğerlerinde başlık zorunlu */
  /** Bölüm tipine göre öğede zorunlu içerik */
  private assertItemContent(type: string, title: string, imageUrl?: string | null, description?: string | null) {
    if (type === 'GALLERY') {
      if (!imageUrl) throw new BadRequestException('Galeri öğesinde görsel olmalı.');
      return;
    }
    if (!title) throw new BadRequestException('Başlık boş olamaz.');
    if (type === 'LOGOS' && !imageUrl) throw new BadRequestException('Logo öğesinde görsel olmalı.');
    if (type === 'TESTIMONIALS' && !description?.trim()) throw new BadRequestException('Yorum metni boş olamaz.');
  }

  private async ensureItemBelongsToSection(sectionId: string, itemId: string) {
    const item = await this.prisma.sectionItem.findFirst({
      where: { id: itemId, sectionId },
      select: { id: true, translations: true },
    });

    if (!item) {
      throw new NotFoundException('Kart bulunamadı.');
    }
    return item;
  }
}
