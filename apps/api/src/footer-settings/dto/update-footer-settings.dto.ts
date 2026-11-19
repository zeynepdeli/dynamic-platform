import { Type } from 'class-transformer';
import { FooterTranslations, type FooterTranslationDto, type TranslationsOf } from '../../i18n/translation-fields.dto.js';
import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  HEX_COLOR_MESSAGE,
  HEX_COLOR_REGEX,
  IsImageUrl,
} from '../../common/validators.js';

export class UpdateFooterSettingsDto {
  @ValidateIf((_, value: unknown) => value != null)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsImageUrl()
  backgroundImage?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(255)
  copyright?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  enabled?: boolean;

  /** Diğer dillerdeki metinler: { "en": { … } } (bkz. src/i18n) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FooterTranslations)
  translations?: TranslationsOf<FooterTranslationDto>;
}
