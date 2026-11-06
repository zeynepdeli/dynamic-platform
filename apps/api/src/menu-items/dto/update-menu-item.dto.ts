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
  @Matches(/^\/(?!\/)[^\s?#]*(?:\?[^#\s]*)?(?:#[^\s]*)?$/, {
    message: 'Bağlantı / ile başlayan site içi bir adres olmalıdır.',
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
