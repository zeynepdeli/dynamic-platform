import {
  IsBoolean,
  IsEnum,
  IsIn,
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
import { MENU_ICON_KEYS } from '../../common/icons.js';
import { MenuLocation } from '../../generated/prisma/enums.js';
import { ReorderWithParentDto } from '../../common/reorder.js';

export class CreateMenuItemDto {
  @IsString()
  @MaxLength(100)
  @Matches(/\S/, {
    message: 'Menü başlığı boş olamaz.',
  })
  label!: string;

  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, {
    message: INTERNAL_PATH_MESSAGE,
  })
  href!: string;

  // null = ikonu kaldır
  @ValidateIf((_, value: unknown) => value != null)
  @IsIn(MENU_ICON_KEYS, { message: 'Geçersiz ikon.' })
  icon?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  order?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  // Oluştururken seçilir, sonradan değişmez
  @IsOptional()
  @IsEnum(MenuLocation, { message: 'Geçersiz menü konumu.' })
  location?: MenuLocation;
}

export class ReorderMenuDto extends ReorderWithParentDto {
  @IsOptional()
  @IsEnum(MenuLocation, { message: 'Geçersiz menü konumu.' })
  location?: MenuLocation;
}
