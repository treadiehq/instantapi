-- Add consoleLogs column to ExecutionLog for observability
ALTER TABLE "ExecutionLog" ADD COLUMN "consoleLogs" JSONB;

