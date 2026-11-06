import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateHeroSlideDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/\S/, {
    message: 'Slider başlığı boş olamaz.',
  })
  title?: string;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(200)
  subtitle?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  imageUrl?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  mobileImageUrl?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(100)
  buttonText?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(500)
  @Matches(/^\/(?!\/)[^\s?#]*(?:\?[^#\s]*)?(?:#[^\s]*)?$/, {
    message: 'Buton bağlantısı / ile başlayan site içi bir adres olmalıdır.',
  })
  buttonHref?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
