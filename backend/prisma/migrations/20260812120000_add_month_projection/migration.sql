-- CreateEnum
CREATE TYPE "MonthProjectionClassification" AS ENUM ('PREVISAO_POSITIVA', 'PREVISAO_EQUILIBRADA', 'PREVISAO_NEGATIVA');

-- CreateEnum
CREATE TYPE "MonthProjectionOrigin" AS ENUM ('IA', 'FALLBACK');

-- AlterEnum
ALTER TYPE "AlertType" ADD VALUE 'ORIENTACAO_D5';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "projectionId" TEXT;

-- CreateTable
CREATE TABLE "MonthProjection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received" DECIMAL(12,2) NOT NULL,
    "pendingIncome" DECIMAL(12,2) NOT NULL,
    "paid" DECIMAL(12,2) NOT NULL,
    "pendingExpense" DECIMAL(12,2) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "projectedBalance" DECIMAL(12,2) NOT NULL,
    "classification" "MonthProjectionClassification" NOT NULL,
    "message" TEXT NOT NULL,
    "origin" "MonthProjectionOrigin" NOT NULL DEFAULT 'IA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthProjection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthProjection_userId_classification_idx" ON "MonthProjection"("userId", "classification");

-- CreateIndex
CREATE UNIQUE INDEX "MonthProjection_userId_year_month_key" ON "MonthProjection"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_projectionId_key" ON "Alert"("projectionId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_projectionId_fkey" FOREIGN KEY ("projectionId") REFERENCES "MonthProjection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthProjection" ADD CONSTRAINT "MonthProjection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;