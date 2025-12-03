-- AlterTable
ALTER TABLE "Endpoint" ADD COLUMN     "rateLimit" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "rateLimitWindow" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "ExecutionLog" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "statusCode" INTEGER DEFAULT 200,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "ExecutionLog_endpointId_createdAt_idx" ON "ExecutionLog"("endpointId", "createdAt");

-- CreateIndex
CREATE INDEX "ExecutionLog_success_idx" ON "ExecutionLog"("success");
