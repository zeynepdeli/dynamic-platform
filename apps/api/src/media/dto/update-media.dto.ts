import { Type } from 'class-transformer';
import { MediaTranslations, type MediaTranslationDto, type TranslationsOf } from '../../i18n/translation-fields.dto.js';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UpdateMediaDto {
  // null/boş = açıklamayı kaldır
  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(200)
  alt!: string | null;

  /** Diğer dillerdeki metinler: { "en": { … } } (bkz. src/i18n) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MediaTranslations)
  translations?: TranslationsOf<MediaTranslationDto>;
}
