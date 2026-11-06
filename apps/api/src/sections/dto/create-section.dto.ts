import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  HEX_COLOR_MESSAGE,
  HEX_COLOR_REGEX,
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
  IsImageUrl,
} from '../../common/validators.js';
import { SectionType } from '../../generated/prisma/enums.js';

export class CreateSectionDto {
  // Boş bırakılırsa bölüm ana sayfaya ait olur
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @IsOptional()
  @IsEnum(SectionType, {
    message: 'Geçersiz bölüm tipi.',
  })
  type?: SectionType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  // Düz metin. HTML olarak render EDİLMEYECEK.
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  body?: string;

  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string;

  @IsOptional()
  @IsImageUrl()
  backgroundImage?: string;

  @IsOptional()
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  textColor?: string;

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
