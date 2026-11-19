import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import {
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
  SINGLE_LINE_REGEX,
} from '../common/validators.js';

import { TranslationsDto } from './translations.dto.js';

/*
 * Her modelin çevrilebilen alanları ve kuralları (asıl alanlarla aynı sınırlar).
 * Boş metin = "çeviri yok" (sitede ana dildeki değer görünür). Listede olmayan alan reddedilir.
 */

const SINGLE_LINE = { message: 'Bu alan tek satır olmalı.' };

const apply =
  (decorators: PropertyDecorator[]): PropertyDecorator =>
  (target, key) =>
    decorators.forEach((d) => d(target, key));
/** Tek satırlık metin */
const line = (max: number) =>
  apply([
    IsOptional(),
    IsString(),
    MaxLength(max),
    Matches(SINGLE_LINE_REGEX, SINGLE_LINE),
  ]);
/** Çok satırlı metin */
const text = (max: number) => apply([IsOptional(), IsString(), MaxLength(max)]);
/** Site içi bağlantı (boş = ana dildeki bağlantı) */
const path = () =>
  apply([
    IsOptional(),
    IsString(),
    MaxLength(500),
    Matches(new RegExp(`(?:^$)|${INTERNAL_PATH_REGEX.source}`), {
      message: INTERNAL_PATH_MESSAGE,
    }),
  ]);

export class SiteSettingsTranslationDto {
  @line(150) siteName?: string;
  @text(500) description?: string;
  @line(40) headerButtonText?: string;
  @path() headerButtonHref?: string;
  @line(150) metaTitle?: string;
  @text(300) metaDescription?: string;
  @line(300) metaKeywords?: string;
}

export class MenuItemTranslationDto {
  @line(100) label?: string;
  @path() href?: string;
}

export class HeroSlideTranslationDto {
  @line(200) title?: string;
  @line(200) subtitle?: string;
  @text(2000) description?: string;
  @line(100) buttonText?: string;
  @path() buttonHref?: string;
}

export class PageTranslationDto {
  @line(150) title?: string;
  /** Bu dildeki adres: /en/about-us. Boşsa ana dildeki slug kullanılır. */
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Adres yalnızca küçük harf, rakam ve tire içerebilir.',
  })
  slug?: string;
  @text(50000) content?: string;
  @line(150) seoTitle?: string;
  @text(300) seoDescription?: string;
  @line(500) seoKeywords?: string;
}

export class SectionTranslationDto {
  @line(200) title?: string;
  @line(300) subtitle?: string;
  @text(5000) body?: string;
  @line(60) buttonText?: string;
  @path() buttonHref?: string;
}

export class SectionItemTranslationDto {
  @line(200) title?: string;
  @line(150) subtitle?: string;
  @text(1000) description?: string;
  @line(60) buttonText?: string;
  @path() buttonHref?: string;
}

export class FooterTranslationDto {
  @text(1000) description?: string;
  @line(255) copyright?: string;
  @text(500) address?: string;
}

export class MediaTranslationDto {
  @line(200) alt?: string;
}

export const SiteSettingsTranslations = TranslationsDto(
  SiteSettingsTranslationDto,
);
export const MenuItemTranslations = TranslationsDto(MenuItemTranslationDto);
export const HeroSlideTranslations = TranslationsDto(HeroSlideTranslationDto);
export const PageTranslations = TranslationsDto(PageTranslationDto);
export const SectionTranslations = TranslationsDto(SectionTranslationDto);
export const SectionItemTranslations = TranslationsDto(
  SectionItemTranslationDto,
);
export const FooterTranslations = TranslationsDto(FooterTranslationDto);
export const MediaTranslations = TranslationsDto(MediaTranslationDto);

export type TranslationsOf<T> = Partial<Record<'tr' | 'en', T>>;
