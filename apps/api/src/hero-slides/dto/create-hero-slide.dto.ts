import { Type } from 'class-transformer';
import { HeroSlideTranslations, type HeroSlideTranslationDto, type TranslationsOf } from '../../i18n/translation-fields.dto.js';
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
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
  IsImageUrl,
} from '../../common/validators.js';

export class CreateHeroSlideDto {
  @IsString()
  @MaxLength(200)
  @Matches(/\S/, {
    message: 'Slider başlığı boş olamaz.',
  })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsImageUrl()
  imageUrl?: string;

  @IsOptional()
  @IsImageUrl()
  mobileImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, {
    message: INTERNAL_PATH_MESSAGE,
  })
  buttonHref?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /** Arka planın önünde duran şeffaf görsel (PNG/WEBP) */
  @ValidateIf((_, v: unknown) => v != null)
  @IsImageUrl()
  foregroundImageUrl?: string | null;

  /** Diğer dillerdeki metinler: { "en": { … } } (bkz. src/i18n) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeroSlideTranslations)
  translations?: TranslationsOf<HeroSlideTranslationDto>;
}
