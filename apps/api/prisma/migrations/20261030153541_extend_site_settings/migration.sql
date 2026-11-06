-- CreateEnum
CREATE TYPE "BackgroundType" AS ENUM ('COLOR', 'IMAGE');

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "backgroundType" "BackgroundType" NOT NULL DEFAULT 'COLOR',
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#183350',
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#346872';
