import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
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

// İkon sadece isim olabilir: "truck", "shield-check" gibi.
// Frontend bu ismi kendi ikon setinden eşleştirir; SVG/HTML kabul edilmez.
export const ICON_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateSectionItemDto {
  @IsString()
  @MaxLength(200)
  @Matches(/\S/, { message: 'Kart başlığı boş olamaz.' })
  title!: string;

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
}
