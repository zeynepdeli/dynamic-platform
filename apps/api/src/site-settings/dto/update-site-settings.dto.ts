import { SUPPORTED_LOCALES, type Locale } from '../../i18n/locales.js';
import { Type } from 'class-transformer';
import { SiteSettingsTranslations, type SiteSettingsTranslationDto, type TranslationsOf } from '../../i18n/translation-fields.dto.js';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  INTERNAL_PATH_MESSAGE,
  INTERNAL_PATH_REGEX,
  HEX_COLOR_MESSAGE,
  HEX_COLOR_REGEX,
  IsImageUrl,
} from '../../common/validators.js';

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
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  backgroundColor?: string;

  @ValidateIf(notNull)
  @IsImageUrl()
  backgroundImage?: string | null;

  // ───── Header ─────
  @ValidateIf(notNull)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  headerBackgroundColor?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  headerBackgroundImage?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(40)
  headerButtonText?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(500)
  @Matches(INTERNAL_PATH_REGEX, { message: INTERNAL_PATH_MESSAGE })
  headerButtonHref?: string | null;

  // ───── SEO ─────
  @ValidateIf(notNull)
  @IsString()
  @MaxLength(150)
  metaTitle?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(300)
  metaDescription?: string | null;

  @ValidateIf(notNull)
  @IsString()
  @MaxLength(300)
  metaKeywords?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  ogImageUrl?: string | null;

  @ValidateIf(sent)
  @IsBoolean()
  allowIndexing?: boolean;

  // Yalnızca GA4 ölçüm kimliği; script/HTML kabul edilmez
  @ValidateIf(notNull)
  @Matches(/^G-[A-Z0-9]{4,15}$/, { message: 'Ölçüm kimliği G-XXXXXXX biçiminde olmalı.' })
  gaMeasurementId?: string | null;

  // Yeni iletişim mesajı bildirimi
  @ValidateIf(notNull)
  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  @MaxLength(254)
  notifyEmail?: string | null;

  // ───── Ana sayfaya özel arka plan (null = genel arka plan) ─────
  @ValidateIf(notNull)
  @Matches(HEX_COLOR_REGEX, { message: HEX_COLOR_MESSAGE })
  homeBackgroundColor?: string | null;

  @ValidateIf(notNull)
  @IsImageUrl()
  homeBackgroundImage?: string | null;

  /** Sitenin ana dili (asıl alanların dili) */
  @ValidateIf(sent)
  @IsIn(SUPPORTED_LOCALES, { message: 'Desteklenmeyen dil.' })
  defaultLocale?: Locale;

  /** Sitede açık diller (ana dil kendiliğinden eklenir) */
  @ValidateIf(sent)
  @IsArray()
  @ArrayMaxSize(SUPPORTED_LOCALES.length)
  @IsIn(SUPPORTED_LOCALES, { each: true, message: 'Desteklenmeyen dil.' })
  locales?: Locale[];

  /** Diğer dillerdeki metinler: { "en": { … } } (bkz. src/i18n) */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SiteSettingsTranslations)
  translations?: TranslationsOf<SiteSettingsTranslationDto>;
}
