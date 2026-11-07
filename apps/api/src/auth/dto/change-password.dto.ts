import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(12, { message: 'Yeni şifre en az 12 karakter olmalı.' })
  @MaxLength(128)
  newPassword!: string;
}
