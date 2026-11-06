import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Doğrulanmış ortam değişkenleri
  const configService = app.get(ConfigService);

  const isProduction =
    configService.getOrThrow<string>('NODE_ENV') === 'production';

  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

  const port = configService.getOrThrow<number>('PORT');

  // Reverse proxy (Nginx, Cloudflare vb.) arkasında gerçek istemci IP'si.
  // 0 = proxy yok. Yanlış değer, rate limit'in tüm kullanıcıları tek IP
  // sanmasına veya X-Forwarded-For ile atlatılmasına yol açar.
  const trustProxyHops = configService.getOrThrow<number>('TRUST_PROXY_HOPS');
  if (trustProxyHops > 0) {
    app.set('trust proxy', trustProxyHops);
  }

  // İstek gövdesi boyut sınırı (DoS koruması). Sayfa içeriği en fazla
  // 50.000 karakter olduğundan 256 KB yeterlidir.
  app.useBodyParser('json', { limit: '256kb' });
  app.useBodyParser('urlencoded', { limit: '64kb', extended: false });

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
      // API yalnızca JSON döndürür; hiçbir kaynak yüklenmesine gerek yok.
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        },
      },
      strictTransportSecurity: isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
          }
        : false,
    }),
  );

  // Medya dosyaları farklı origin'deki web sitesinde <img> ile
  // gösterilebilmeli. Helmet varsayılanı (same-origin) bunu engeller.
  app.use('/media', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

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
