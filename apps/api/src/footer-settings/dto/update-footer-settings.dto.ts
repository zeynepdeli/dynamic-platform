import {
  IsBoolean,
  IsEmail,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateFooterSettingsDto {
  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(255)
  copyright?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
  })
  @MaxLength(500)
  facebookUrl?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
  })
  @MaxLength(500)
  instagramUrl?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
  })
  @MaxLength(500)
  linkedinUrl?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
  })
  @MaxLength(500)
  youtubeUrl?: string | null;

  @ValidateIf((_, value: unknown) => value != null)
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
  })
  @MaxLength(500)
  githubUrl?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  enabled?: boolean;
}
