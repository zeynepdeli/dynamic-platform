-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Section_pageId_key_key" ON "Section"("pageId", "key");
