-- Performance optimization: Add compound indexes for common query patterns

-- Tunnel compound indexes
CREATE INDEX "Tunnel_organizationId_isActive_idx" ON "Tunnel"("organizationId", "isActive");
CREATE INDEX "Tunnel_isActive_lastSeenAt_idx" ON "Tunnel"("isActive", "lastSeenAt");

-- TunnelRequest compound indexes
CREATE INDEX "TunnelRequest_method_idx" ON "TunnelRequest"("method");
CREATE INDEX "TunnelRequest_tunnelId_status_idx" ON "TunnelRequest"("tunnelId", "status");
CREATE INDEX "TunnelRequest_status_createdAt_idx" ON "TunnelRequest"("status", "createdAt");
CREATE INDEX "TunnelRequest_tunnelId_status_createdAt_idx" ON "TunnelRequest"("tunnelId", "status", "createdAt");

