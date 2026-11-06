import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PagesModule } from './pages/pages.module.js';
import { SiteSettingsModule } from './site-settings/site-settings.module.js';
import { MenuItemsModule } from './menu-items/menu-items.module.js';
import { HeroSlidesModule } from './hero-slides/hero-slides.module.js';
import { MediaModule } from './media/media.module.js';
import { FooterSettingsModule } from './footer-settings/footer-settings.module.js';
import { SiteBootstrapModule } from './site-bootstrap/site-bootstrap.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Global istek sınırlama
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),

    PrismaModule,
    AuthModule,
    PagesModule,
    SiteSettingsModule,
    MenuItemsModule,
    HeroSlidesModule,
    MediaModule,
    FooterSettingsModule,
    SiteBootstrapModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
