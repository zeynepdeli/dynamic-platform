import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { IsImageUrl, SINGLE_LINE_REGEX } from '../../common/validators.js';
import { PostTranslations, type PostTranslationDto, type TranslationsOf } from '../../i18n/translation-fields.dto.js';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreatePostDto {
  @IsString({ message: 'Başlık metin olmalı.' })
  @IsNotEmpty({ message: 'Başlık boş olamaz.' })
  @MaxLength(200, { message: 'Başlık en fazla 200 karakter olabilir.' })
  @Matches(SINGLE_LINE_REGEX, { message: 'Başlık tek satır olmalı.' })
  title!: string;

  @IsString({ message: 'Adres metin olmalı.' })
  @IsNotEmpty({ message: 'Adres boş olamaz.' })
  @MaxLength(150, { message: 'Adres en fazla 150 karakter olabilir.' })
  @Matches(SLUG_REGEX, { message: 'Adres yalnızca küçük harf, rakam ve kelimeler arasında tire içerebilir.' })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string | null;

  @IsOptional()
  @IsImageUrl()
  coverImageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(SINGLE_LINE_REGEX, { message: 'Kategori tek satır olmalı.' })
  category?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  /** ISO tarih. İleri bir tarih → o ana kadar sitede görünmez (zamanlanmış yazı). */
  @IsOptional()
  @ValidateIf((_, v: unknown) => v !== null)
  @IsISO8601({ strict: true }, { message: 'Yayın tarihi geçerli bir tarih olmalıdır.' })
  publishedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string | null;

  /** Diğer dillerdeki metinler: { "en": { … } } */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PostTranslations)
  translations?: TranslationsOf<PostTranslationDto>;
}
