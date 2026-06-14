-- Replace deprecated light theme with lava
UPDATE "UserThemeUnlock" SET "themeId" = 'lava' WHERE "themeId" = 'light';
UPDATE "User" SET "themeId" = 'lava' WHERE "themeId" = 'light';
