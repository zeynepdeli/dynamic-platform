-- Çok dil (TR/EN, siteye göre açılır). Asıl sütunlar ana dilde; diğer dillerin metinleri translations JSON'unda.
ALTER TABLE "SiteSettings" ADD COLUMN "defaultLocale" TEXT NOT NULL DEFAULT 'tr',
ADD COLUMN "locales" TEXT[] DEFAULT ARRAY['tr']::TEXT[],
ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "MenuItem" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "HeroSlide" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Page" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "FooterSettings" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Media" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Section" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "SectionItem" ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';
