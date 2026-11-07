import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Kullanıcı bulunamadığında da Argon2 doğrulaması yapabilmek için
  // kullanılan sahte hash. Böylece "kayıtlı / kayıtsız e-posta" yanıt
  // süreleri birbirine yakın olur (OWASP A07 - user enumeration).
  private dummyHashPromise?: Promise<string>;

  private getDummyHash(): Promise<string> {
    this.dummyHashPromise ??= this.hashPassword(
      'dummy-password-for-timing-safety',
    );
    return this.dummyHashPromise;
  }

  // Parolayı Argon2id ile güvenli şekilde hash'ler.
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  // Girilen parolayı kayıtlı hash ile karşılaştırır.
  async verifyPassword(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }

  // Kullanıcıyı e-posta adresine göre bulur.
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  // Yeni kullanıcı kaydı oluşturur.
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresiyle kayıt yapılamıyor.');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return user;
  }

  // Giriş bilgilerini doğrular.
  async validateUser(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.findUserByEmail(email);

    if (!user) {
      // Süre farkı oluşmaması için yine de bir doğrulama çalıştır.
      await this.verifyPassword(await this.getDummyHash(), dto.password);
      throw new UnauthorizedException('E-posta veya parola hatalı.');
    }

    const passwordValid = await this.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!passwordValid || !user.active) {
      throw new UnauthorizedException('E-posta veya parola hatalı.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
  /**
   * Şifre değiştir: mevcut şifre doğrulanır, eski oturumlar geçersiz olur
   * (passwordChangedAt), yeni bir oturum anahtarı döner.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.active) throw new UnauthorizedException('Geçersiz oturum.');

    const valid = await this.verifyPassword(user.passwordHash, currentPassword);
    if (!valid) throw new BadRequestException('Mevcut şifre hatalı.');

    if (currentPassword === newPassword) {
      throw new BadRequestException('Yeni şifre eskisiyle aynı olamaz.');
    }

    // JWT 'iat' saniye hassasiyetinde: yeni token eskilerden ayrılsın diye
    // değişiklik zamanı tam saniyeye yuvarlanır ve yeni token sonra verilir.
    const changedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.hashPassword(newPassword),
        passwordChangedAt: changedAt,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });
    return { accessToken, tokenType: 'Bearer', expiresIn: 900 };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }
}
