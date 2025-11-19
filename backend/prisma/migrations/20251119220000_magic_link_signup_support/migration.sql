-- AlterTable MagicLink - add signup support
ALTER TABLE "MagicLink" ADD COLUMN "email" TEXT;
ALTER TABLE "MagicLink" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'login';
ALTER TABLE "MagicLink" ADD COLUMN "organizationName" TEXT;
ALTER TABLE "MagicLink" ALTER COLUMN "userId" DROP NOT NULL;

-- Update existing magic links to have email from their users
UPDATE "MagicLink" ml
SET "email" = u."email"
FROM "User" u
WHERE ml."userId" = u.id AND ml."email" IS NULL;

-- Now make email required
ALTER TABLE "MagicLink" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE INDEX "MagicLink_email_idx" ON "MagicLink"("email");

