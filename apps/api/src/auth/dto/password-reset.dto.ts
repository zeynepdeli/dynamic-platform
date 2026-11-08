import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  token!: string;

  @IsString()
  @MinLength(12, { message: 'Yeni şifre en az 12 karakter olmalı.' })
  @MaxLength(128)
  newPassword!: string;
}
