-- AlterTable
ALTER TABLE "Endpoint" ADD COLUMN     "description" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'snippet',
ADD COLUMN     "name" TEXT,
ADD COLUMN     "ttlHours" INTEGER NOT NULL DEFAULT 24;

-- CreateTable
CREATE TABLE "ExecutionLog" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "requestBody" JSONB,
    "responseBody" JSONB,

    CONSTRAINT "ExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecutionLog_endpointId_idx" ON "ExecutionLog"("endpointId");

-- CreateIndex
CREATE INDEX "ExecutionLog_createdAt_idx" ON "ExecutionLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ExecutionLog" ADD CONSTRAINT "ExecutionLog_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
