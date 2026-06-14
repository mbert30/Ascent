-- AlterTable: remove name/image, add themeId
ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
ALTER TABLE "User" DROP COLUMN IF EXISTS "image";
ALTER TABLE "User" ADD COLUMN "themeId" TEXT NOT NULL DEFAULT 'dark';

-- CreateTable
CREATE TABLE "UserThemeUnlock" (
    "userId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserThemeUnlock_pkey" PRIMARY KEY ("userId","themeId")
);

-- AddForeignKey
ALTER TABLE "UserThemeUnlock" ADD CONSTRAINT "UserThemeUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed existing users with default dark theme
INSERT INTO "UserThemeUnlock" ("userId", "themeId", "source")
SELECT "id", 'dark', 'default' FROM "User"
ON CONFLICT DO NOTHING;
