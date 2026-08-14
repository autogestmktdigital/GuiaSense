-- CreateEnum
CREATE TYPE "AlertOrigin" AS ENUM ('IA', 'BACKEND');

-- AlterEnum
ALTER TYPE "AlertType" ADD VALUE 'CONTA_ATRASADA';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "origin" "AlertOrigin" NOT NULL DEFAULT 'IA',
ADD COLUMN     "transactionIds" JSONB,
ADD COLUMN     "homeDisplayUntil" TIMESTAMP(3),
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Alert_userId_type_status_idx" ON "Alert"("userId", "type", "status");