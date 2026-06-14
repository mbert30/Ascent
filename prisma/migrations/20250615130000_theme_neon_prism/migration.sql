-- Rename deprecated emerald theme to neon for existing users
UPDATE "UserThemeUnlock" SET "themeId" = 'neon' WHERE "themeId" = 'emerald';
UPDATE "User" SET "themeId" = 'neon' WHERE "themeId" = 'emerald';
