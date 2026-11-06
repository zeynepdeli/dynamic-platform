import {
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

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
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  logoUrl?: string;

  @IsOptional()
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
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
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
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
