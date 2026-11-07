-- Menü ikonları
ALTER TABLE "MenuItem" ADD COLUMN "icon" TEXT;

-- Sosyal medya bağlantıları (sabit 5 alan yerine sıralanabilir liste)
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialLink_order_idx" ON "SocialLink"("order");

-- Mevcut verileri taşı (veri kaybı olmasın)
INSERT INTO "SocialLink" ("id", "icon", "url", "order", "updatedAt")
SELECT gen_random_uuid()::text, v.icon, v.url, v.ord, CURRENT_TIMESTAMP
FROM "FooterSettings" f
CROSS JOIN LATERAL (VALUES
    ('instagram', f."instagramUrl", 0),
    ('facebook',  f."facebookUrl",  1),
    ('linkedin',  f."linkedinUrl",  2),
    ('youtube',   f."youtubeUrl",   3),
    ('github',    f."githubUrl",    4)
) AS v(icon, url, ord)
WHERE f."id" = 'main' AND v.url IS NOT NULL AND v.url <> '';

ALTER TABLE "FooterSettings"
    DROP COLUMN "facebookUrl",
    DROP COLUMN "instagramUrl",
    DROP COLUMN "linkedinUrl",
    DROP COLUMN "youtubeUrl",
    DROP COLUMN "githubUrl";
