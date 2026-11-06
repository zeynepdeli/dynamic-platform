import {
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsImageUrl } from '../../common/validators.js';

import { BackgroundType } from '../../generated/prisma/enums.js';

export class UpdateSiteSettingsDto {
  // Genel site bilgileri
  @IsOptional()
  @IsString()
  @MaxLength(150)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  // Marka görselleri
  @IsOptional()
  @IsImageUrl()
  logoUrl?: string;

  @IsOptional()
  @IsImageUrl()
  faviconUrl?: string;

  // Tema renkleri
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  // Arka plan ayarları
  @IsOptional()
  @IsEnum(BackgroundType)
  backgroundType?: BackgroundType;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsImageUrl()
  backgroundImage?: string;

  // SEO ayarları
  @IsOptional()
  @IsString()
  @MaxLength(150)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;
}
