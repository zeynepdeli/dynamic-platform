import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(12, { message: 'Şifre en az 12 karakter olmalı.' })
  @MaxLength(128)
  password!: string;
}

export class UpdateAdminUserDto {
  @IsBoolean()
  active!: boolean;
}
