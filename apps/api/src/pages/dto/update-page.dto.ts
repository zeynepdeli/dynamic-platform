import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdatePageDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug yalnızca küçük harf, rakam ve kelimeler arasında tire içerebilir.',
  })
  slug?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(50000)
  content?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  published?: boolean;

  // Sayfa bazlı SEO

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(150)
  seoTitle?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(300)
  seoDescription?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(500)
  seoKeywords?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
  })
  @MaxLength(500)
  ogImageUrl?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  noIndex?: boolean;
}
