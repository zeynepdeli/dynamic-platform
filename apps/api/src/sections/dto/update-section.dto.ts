import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  HEX_COLOR_MESSAGE,
  HEX_COLOR_REGEX,
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
  IsImageUrl,
  SECTION_KEY_MESSAGE,
  SECTION_KEY_REGEX,
  SINGLE_LINE_REGEX,
  VIDEO_URL_MESSAGE,
  VIDEO_URL_REGEX,
} from '../../common/validators.js';
import { SectionType } from '../../generated/prisma/enums.js';

// null gönderilen alan temizlenir, gönderilmeyen alan değişmez.
const notNull = (_: object, value: unknown) => value != null;

export class UpdateSectionDto {
  // null = anahtarı kaldır
  @ValidateIf(notNull)
  @IsString()
  @MaxLength(50)
  @Matches(SECTION_KEY_REGEX, { message: SECTION_KEY_MESSAGE })
  key?: string | null;

  @IsOptional()
  @IsEnum(SectionType, { message: 'Geçersiz bölüm tipi.' })
  type?: SectionType;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(300)
  subtitle?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(5000)
  body?: string | null;

  @ValidateIf(notNull)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  backgroundImage?: string | null;

  @ValidateIf(notNull)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  textColor?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(60)
  buttonText?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, { message: INTERNAL_PATH_MESSAGE })
  buttonHref?: string | null;

  @ValidateIf((_, v: unknown) => v != null)
  @IsString()
  @MaxLength(300)
  @Matches(VIDEO_URL_REGEX, { message: VIDEO_URL_MESSAGE })
  videoUrl?: string | null;

  @ValidateIf((_, v: unknown) => v != null)
  @IsString()
  @MaxLength(300)
  @Matches(SINGLE_LINE_REGEX, { message: 'Adres tek satır olmalı.' })
  mapAddress?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  columns?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
