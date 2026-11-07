-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "backgroundColor" TEXT,
ADD COLUMN     "backgroundImage" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "homeBackgroundColor" TEXT,
ADD COLUMN     "homeBackgroundImage" TEXT;
