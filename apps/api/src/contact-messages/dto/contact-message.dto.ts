import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+()\-\s]*$/, { message: 'Geçerli bir telefon girin.' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @IsString()
  @MinLength(10, { message: 'Mesaj en az 10 karakter olmalı.' })
  @MaxLength(5000)
  message!: string;

  /**
   * Bal küpü (honeypot): formda gizli alan. İnsanlar boş bırakır,
   * botlar doldurur. Doluysa mesaj sessizce yok sayılır.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class UpdateContactMessageDto {
  @IsBoolean()
  read!: boolean;
}
