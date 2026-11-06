import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsImageUrl } from '../../common/validators.js';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug yalnızca küçük harf, rakam ve kelimeler arasında tire içerebilir.',
  })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  // Sayfa bazlı SEO

  @IsOptional()
  @IsString()
  @MaxLength(150)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoKeywords?: string | null;

  @IsOptional()
  @IsImageUrl()
  ogImageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;
}
