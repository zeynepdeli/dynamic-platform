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
import { ICON_NAME_REGEX } from './create-section-item.dto.js';

const notNull = (_: object, value: unknown) => value != null;

export class UpdateSectionItemDto {
  // Başlık zorunlu alan: değiştirilebilir ama null yapılamaz
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  imageUrl?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(50)
  @Matches(ICON_NAME_REGEX, {
    message: 'İkon adı yalnızca küçük harf, rakam ve tire içerebilir.',
  })
  icon?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(60)
  buttonText?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, { message: INTERNAL_PATH_MESSAGE })
  buttonHref?: string | null;

  @ValidateIf(notNull)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  backgroundImage?: string | null;

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
