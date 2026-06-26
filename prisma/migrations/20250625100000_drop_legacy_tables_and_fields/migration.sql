-- Drop legacy social / badge tables
DROP TABLE IF EXISTS "UserBadge";
DROP TABLE IF EXISTS "Badge";
DROP TABLE IF EXISTS "UserFollows";

-- Drop unused User / UserReward columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "bio";
ALTER TABLE "UserReward" DROP COLUMN IF EXISTS "isConsumed";

-- MissionStatus: remove OVERDUE (overdue is derived client-side from dueAt)
UPDATE "Mission" SET "status" = 'SCHEDULED' WHERE "status" = 'OVERDUE';

ALTER TYPE "MissionStatus" RENAME TO "MissionStatus_old";
CREATE TYPE "MissionStatus" AS ENUM ('SCHEDULED', 'COMPLETED');
ALTER TABLE "Mission"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "MissionStatus" USING ("status"::text::"MissionStatus"),
  ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
DROP TYPE "MissionStatus_old";
