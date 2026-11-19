import { Type } from 'class-transformer';
import { SectionItemTranslations, type SectionItemTranslationDto, type TranslationsOf } from '../../i18n/translation-fields.dto.js';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  HEX_COLOR_MESSAGE,
  HEX_COLOR_REGEX,
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
  IsHttpsUrl,
  IsImageUrl,
  SINGLE_LINE_REGEX,
} from '../../common/validators.js';

// İkon sadece isim olabilir: "truck", "shield-check" gibi.
// Frontend bu ismi kendi ikon setinden eşleştirir; SVG/HTML kabul edilmez.
export const ICON_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateSectionItemDto {
  // Galeride alt yazı isteğe bağlı; diğer türlerde zorunluluğu servis denetler
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsImageUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(ICON_NAME_REGEX, {
    message: 'İkon adı yalnızca küçük harf, rakam ve tire içerebilir.',
  })
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  buttonText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, { message: INTERNAL_PATH_MESSAGE })
  buttonHref?: string;

  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string;

  @IsOptional()
  @IsImageUrl()
  backgroundImage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /** Ekip: unvan · Yorum: şirket/unvan */
  @ValidateIf((_, v: unknown) => v != null)
  @IsString()
  @MaxLength(150)
  @Matches(SINGLE_LINE_REGEX, { message: 'Alt başlık tek satır olmalı.' })
  subtitle?: string | null;

  /** Yorum puanı 1–5 */
  @ValidateIf((_, v: unknown) => v != null)
  @IsInt({ message: 'Puan 1 ile 5 arasında tam sayı olmalıdır.' })
  @Min(1, { message: 'Puan 1 ile 5 arasında tam sayı olmalıdır.' })
  @Max(5, { message: 'Puan 1 ile 5 arasında tam sayı olmalıdır.' })
  rating?: number | null;

  /** Dış bağlantı (yalnızca https): marka sitesi, LinkedIn vb. */
  @ValidateIf((_, v: unknown) => v != null)
  @IsHttpsUrl()
  linkUrl?: string | null;

  /** Diğer dillerdeki metinler: { "en": { … } } (bkz. src/i18n) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SectionItemTranslations)
  translations?: TranslationsOf<SectionItemTranslationDto>;
}
