import {
  IsBoolean,
  IsEmail,
  IsString,
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

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  enabled?: boolean;
}
