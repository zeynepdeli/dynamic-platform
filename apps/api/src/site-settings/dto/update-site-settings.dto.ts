import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import {
  HEX_COLOR_MESSAGE,
  HEX_COLOR_REGEX,
  IsImageUrl,
} from '../../common/validators.js';
import { BackgroundType } from '../../generated/prisma/enums.js';

// Zorunlu alan: gönderilmeyebilir ama null OLAMAZ
const sent = (_: object, value: unknown) => value !== undefined;
// Opsiyonel alan: null gönderilirse temizlenir
const notNull = (_: object, value: unknown) => value != null;

export class UpdateSiteSettingsDto {
  // ───── Genel ─────
  @ValidateIf(sent)
  @IsString()
  @MaxLength(150)
  @Matches(/\S/, { message: 'Site adı boş olamaz.' })
  siteName?: string;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  // ───── Marka görselleri ─────
  @ValidateIf(notNull)
  @IsImageUrl()
  logoUrl?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  faviconUrl?: string | null;

  // ───── Tema renkleri ─────
  @ValidateIf(sent)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  primaryColor?: string;

  @ValidateIf(sent)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  secondaryColor?: string;

  // ───── Arka plan ─────
  @ValidateIf(sent)
  @IsEnum(BackgroundType, { message: 'Geçersiz arka plan tipi.' })
  backgroundType?: BackgroundType;

  @ValidateIf(sent)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string;

  @ValidateIf(notNull)
  @IsImageUrl()
  backgroundImage?: string | null;

  // ───── SEO ─────
  @ValidateIf(notNull)
  @IsString()
  @MaxLength(150)
  metaTitle?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(300)
  metaDescription?: string | null;

  // ───── Ana sayfaya özel arka plan (null = genel arka plan) ─────
  @ValidateIf(notNull)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  homeBackgroundColor?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  homeBackgroundImage?: string | null;
}
