import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
} from '../../common/validators.js';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/\S/, {
    message: 'Menü başlığı boş olamaz.',
  })
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, {
    message: INTERNAL_PATH_MESSAGE,
  })
  href?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  order?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  parentId?: string | null;
}
