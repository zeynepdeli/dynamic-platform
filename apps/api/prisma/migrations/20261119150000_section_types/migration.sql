-- Yeni bölüm tipleri (Logolar, Ekip, Yorumlar), kart alanları ve slider ön plan görseli
ALTER TYPE "SectionType" ADD VALUE 'LOGOS';
ALTER TYPE "SectionType" ADD VALUE 'TEAM';
ALTER TYPE "SectionType" ADD VALUE 'TESTIMONIALS';

ALTER TABLE "SectionItem" ADD COLUMN "subtitle" TEXT,
ADD COLUMN "rating" INTEGER,
ADD COLUMN "linkUrl" TEXT;

ALTER TABLE "HeroSlide" ADD COLUMN "foregroundImageUrl" TEXT;
