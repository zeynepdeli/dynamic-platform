import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { SOCIAL_ICON_KEYS } from '../../common/icons.js';

const HTTPS_URL = {
  protocols: ['https'],
  require_protocol: true,
  require_tld: true,
  disallow_auth: true,
};
const ICON_MESSAGE = 'Geçersiz ikon.';
const URL_MESSAGE = 'Adres https:// ile başlayan geçerli bir bağlantı olmalı.';

export class CreateSocialLinkDto {
  @IsIn(SOCIAL_ICON_KEYS, { message: ICON_MESSAGE })
  icon!: string;

  @ValidateIf((_, v: unknown) => v != null)
  @IsString()
  @MaxLength(60)
  label?: string | null;

  @IsUrl(HTTPS_URL, { message: URL_MESSAGE })
  @MaxLength(500)
  url!: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

export class UpdateSocialLinkDto {
  @IsOptional()
  @IsIn(SOCIAL_ICON_KEYS, { message: ICON_MESSAGE })
  icon?: string;

  @ValidateIf((_, v: unknown) => v != null)
  @IsString()
  @MaxLength(60)
  label?: string | null;

  @IsOptional()
  @IsUrl(HTTPS_URL, { message: URL_MESSAGE })
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
