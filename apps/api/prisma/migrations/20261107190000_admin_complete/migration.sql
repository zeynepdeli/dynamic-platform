-- Site arka planı: renk + fotoğraf birlikte (tip seçimi kalktı)
ALTER TABLE "SiteSettings" DROP COLUMN "backgroundType";
DROP TYPE "BackgroundType";

-- Header arka planı + buton, SEO
ALTER TABLE "SiteSettings"
    ADD COLUMN "headerBackgroundColor" TEXT,
    ADD COLUMN "headerBackgroundImage" TEXT,
    ADD COLUMN "headerButtonText" TEXT,
    ADD COLUMN "headerButtonHref" TEXT,
    ADD COLUMN "metaKeywords" TEXT,
    ADD COLUMN "ogImageUrl" TEXT,
    ADD COLUMN "allowIndexing" BOOLEAN NOT NULL DEFAULT true;

-- Footer arka planı
ALTER TABLE "FooterSettings"
    ADD COLUMN "backgroundColor" TEXT,
    ADD COLUMN "backgroundImage" TEXT;

-- Kart arka plan fotoğrafı
ALTER TABLE "SectionItem" ADD COLUMN "backgroundImage" TEXT;

-- Footer menü linkleri
CREATE TYPE "MenuLocation" AS ENUM ('HEADER', 'FOOTER');
ALTER TABLE "MenuItem" ADD COLUMN "location" "MenuLocation" NOT NULL DEFAULT 'HEADER';
DROP INDEX IF EXISTS "MenuItem_parentId_order_idx";
CREATE INDEX "MenuItem_location_parentId_order_idx" ON "MenuItem"("location", "parentId", "order");

-- Şifre değişince eski oturumları geçersiz kılmak için
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- İletişim mesajları
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContactMessage_read_createdAt_idx" ON "ContactMessage"("read", "createdAt");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
