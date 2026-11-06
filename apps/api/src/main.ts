import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Doğrulanmış ortam değişkenleri
  const configService = app.get(ConfigService);

  const isProduction =
    configService.getOrThrow<string>('NODE_ENV') === 'production';

  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

  const port = configService.getOrThrow<number>('PORT');

  // CORS yapılandırması
  app.enableCors({
    origin: [frontendUrl],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  // Express teknoloji bilgisini gizle
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // HTTP güvenlik başlıkları
  app.use(
    helmet({
      strictTransportSecurity: isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
          }
        : false,
    }),
  );

  // ADMIN yanıtlarının önbelleğe alınmasını engelle
  app.use('/admin', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // AUTH yanıtlarının önbelleğe alınmasını engelle
  app.use('/auth', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Global DTO doğrulama
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // API'yi başlat
  await app.listen(port);
}

void bootstrap();
