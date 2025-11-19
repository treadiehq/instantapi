-- CreateTable
CREATE TABLE "Tunnel" (
    "id" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tunnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TunnelRequest" (
    "id" TEXT NOT NULL,
    "tunnelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "body" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "responseStatus" INTEGER,
    "responseHeaders" JSONB,
    "responseBody" JSONB,

    CONSTRAINT "TunnelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tunnel_isActive_idx" ON "Tunnel"("isActive");

-- CreateIndex
CREATE INDEX "Tunnel_lastSeenAt_idx" ON "Tunnel"("lastSeenAt");

-- CreateIndex
CREATE INDEX "TunnelRequest_tunnelId_idx" ON "TunnelRequest"("tunnelId");

-- CreateIndex
CREATE INDEX "TunnelRequest_status_idx" ON "TunnelRequest"("status");

-- CreateIndex
CREATE INDEX "TunnelRequest_createdAt_idx" ON "TunnelRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "TunnelRequest" ADD CONSTRAINT "TunnelRequest_tunnelId_fkey" FOREIGN KEY ("tunnelId") REFERENCES "Tunnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
