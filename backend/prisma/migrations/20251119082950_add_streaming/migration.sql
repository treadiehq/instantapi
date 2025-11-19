-- AlterTable
ALTER TABLE "TunnelRequest" ADD COLUMN     "isStreaming" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TunnelStreamEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "chunk" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TunnelStreamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TunnelStreamEvent_requestId_sequence_idx" ON "TunnelStreamEvent"("requestId", "sequence");

-- CreateIndex
CREATE INDEX "TunnelStreamEvent_createdAt_idx" ON "TunnelStreamEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "TunnelStreamEvent" ADD CONSTRAINT "TunnelStreamEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TunnelRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
