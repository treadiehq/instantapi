-- AlterTable
ALTER TABLE "TunnelRequest" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "requestSize" INTEGER,
ADD COLUMN     "responseSize" INTEGER;

-- CreateIndex
CREATE INDEX "TunnelRequest_tunnelId_createdAt_idx" ON "TunnelRequest"("tunnelId", "createdAt");

