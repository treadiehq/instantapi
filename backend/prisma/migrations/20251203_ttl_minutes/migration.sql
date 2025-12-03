-- Convert ttlHours to ttlMinutes
-- First add the new column
ALTER TABLE "Endpoint" ADD COLUMN "ttlMinutes" INTEGER;

-- Convert existing ttlHours values to minutes
UPDATE "Endpoint" SET "ttlMinutes" = "ttlHours" * 60;

-- Set default and not null
ALTER TABLE "Endpoint" ALTER COLUMN "ttlMinutes" SET NOT NULL;
ALTER TABLE "Endpoint" ALTER COLUMN "ttlMinutes" SET DEFAULT 60;

-- Drop the old column
ALTER TABLE "Endpoint" DROP COLUMN "ttlHours";

