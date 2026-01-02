-- Add secretToken column to Tunnel table for authentication
-- This column is required for secure tunnel operations (especially for unauthenticated users)

-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Add the column (nullable initially)
ALTER TABLE "Tunnel" ADD COLUMN "secretToken" TEXT;

-- Step 2: Generate unique tokens for any existing tunnels
UPDATE "Tunnel" SET "secretToken" = encode(gen_random_bytes(32), 'hex') WHERE "secretToken" IS NULL;

-- Step 3: Make the column NOT NULL now that all rows have values
ALTER TABLE "Tunnel" ALTER COLUMN "secretToken" SET NOT NULL;

-- Step 4: Add unique constraint
CREATE UNIQUE INDEX "Tunnel_secretToken_key" ON "Tunnel"("secretToken");

-- Step 5: Add performance index for secretToken lookups
CREATE INDEX "Tunnel_secretToken_idx" ON "Tunnel"("secretToken");
