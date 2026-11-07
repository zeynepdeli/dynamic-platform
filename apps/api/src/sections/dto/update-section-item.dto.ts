import {
  IsBoolean,
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
} from '../../common/validators.js';
import { ICON_NAME_REGEX } from './create-section-item.dto.js';

const notNull = (_: object, value: unknown) => value != null;

export class UpdateSectionItemDto {
  // Başlık zorunlu alan: değiştirilebilir ama null yapılamaz
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/\S/, { message: 'Kart başlığı boş olamaz.' })
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
}
