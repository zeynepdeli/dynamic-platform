import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PagesModule } from './pages/pages.module.js';
import { SiteSettingsModule } from './site-settings/site-settings.module.js';
import { MenuItemsModule } from './menu-items/menu-items.module.js';
import { HeroSlidesModule } from './hero-slides/hero-slides.module.js';
import { MediaModule } from './media/media.module.js';
import { FooterSettingsModule } from './footer-settings/footer-settings.module.js';
import { SiteBootstrapModule } from './site-bootstrap/site-bootstrap.module.js';
import { validateEnv } from './config/env.validation.js';
import { SectionsModule } from './sections/sections.module.js';
import { AppThrottlerGuard } from './common/app-throttler.guard.js';
import { SocialLinksModule } from './social-links/social-links.module.js';
import { ContactMessagesModule } from './contact-messages/contact-messages.module.js';
import { MailModule } from './mail/mail.module.js';
import { UsersModule } from './users/users.module.js';
import { FeaturesModule } from './features/features.module.js';
import { CommerceModule } from './commerce/commerce.module.js';

@Module({
  imports: [
    // Ortam değişkenleri uygulama açılırken Zod ile doğrulanır.
    // Eksik/zayıf JWT_SECRET vb. durumda uygulama hiç başlamaz.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),

    // Global istek sınırlama
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        // Saatlik üst sınır (iletişim formu gibi uçlar daha sıkı ayarlar)
        name: 'long',
        ttl: 3_600_000,
        limit: 3000,
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
    SectionsModule,
    SocialLinksModule,
    ContactMessagesModule,
    MailModule,
    UsersModule,
    FeaturesModule,

    // İsteğe bağlı modüller
    // Kapalıysa uçları hiç yüklenmez. .env okunduktan sonra karar verilir.
    ConditionalModule.registerWhen(
      CommerceModule,
      (env: NodeJS.ProcessEnv) => env.COMMERCE_ENABLED === 'true',
    ),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule {}
