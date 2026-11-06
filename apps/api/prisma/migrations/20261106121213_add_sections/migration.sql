-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('CARDS', 'TEXT', 'IMAGE_TEXT', 'CTA');

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "type" "SectionType" NOT NULL DEFAULT 'CARDS',
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "backgroundColor" TEXT,
    "backgroundImage" TEXT,
    "textColor" TEXT,
    "buttonText" TEXT,
    "buttonHref" TEXT,
    "columns" INTEGER NOT NULL DEFAULT 3,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "icon" TEXT,
    "buttonText" TEXT,
    "buttonHref" TEXT,
    "backgroundColor" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Section_pageId_active_order_idx" ON "Section"("pageId", "active", "order");

-- CreateIndex
CREATE INDEX "SectionItem_sectionId_active_order_idx" ON "SectionItem"("sectionId", "active", "order");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionItem" ADD CONSTRAINT "SectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
