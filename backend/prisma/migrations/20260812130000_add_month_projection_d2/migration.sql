-- CreateEnum
CREATE TYPE "MonthProjectionD2Variation" AS ENUM ('MELHOROU', 'PRATICAMENTE_IGUAL', 'PIOROU');

-- AlterEnum
ALTER TYPE "AlertType" ADD VALUE 'ORIENTACAO_D2';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "projectionD2Id" TEXT;

-- CreateTable
CREATE TABLE "MonthProjectionD2" (
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
    "d5ProjectedBalance" DECIMAL(12,2) NOT NULL,
    "d5Classification" "MonthProjectionClassification" NOT NULL,
    "projectionDifference" DECIMAL(12,2) NOT NULL,
    "variationType" "MonthProjectionD2Variation" NOT NULL,
    "classificationChanged" BOOLEAN NOT NULL DEFAULT false,
    "facts" JSONB,
    "message" TEXT NOT NULL,
    "origin" "MonthProjectionOrigin" NOT NULL DEFAULT 'IA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthProjectionD2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthProjectionD2_userId_classification_idx" ON "MonthProjectionD2"("userId", "classification");

-- CreateIndex
CREATE UNIQUE INDEX "MonthProjectionD2_userId_year_month_key" ON "MonthProjectionD2"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_projectionD2Id_key" ON "Alert"("projectionD2Id");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_projectionD2Id_fkey" FOREIGN KEY ("projectionD2Id") REFERENCES "MonthProjectionD2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthProjectionD2" ADD CONSTRAINT "MonthProjectionD2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;