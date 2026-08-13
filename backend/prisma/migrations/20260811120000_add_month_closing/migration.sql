-- CreateEnum
CREATE TYPE "MonthClosingStatus" AS ENUM ('PENDENTE', 'FECHADO');

-- CreateEnum
CREATE TYPE "MonthClosingClassification" AS ENUM ('POSITIVO', 'EQUILIBRADO', 'NEGATIVO');

-- CreateEnum
CREATE TYPE "MonthClosingOrigin" AS ENUM ('IA', 'FALLBACK');

-- AlterEnum
ALTER TYPE "AlertType" ADD VALUE 'FECHAMENTO_MENSAL';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "closingId" TEXT;

-- CreateTable
CREATE TABLE "MonthClosing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" "MonthClosingStatus" NOT NULL DEFAULT 'PENDENTE',
    "classification" "MonthClosingClassification",
    "balance" DECIMAL(12,2) NOT NULL,
    "received" DECIMAL(12,2) NOT NULL,
    "paid" DECIMAL(12,2) NOT NULL,
    "pendingExpense" DECIMAL(12,2) NOT NULL,
    "pendingIncome" DECIMAL(12,2) NOT NULL,
    "message" TEXT NOT NULL,
    "origin" "MonthClosingOrigin" NOT NULL DEFAULT 'IA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthClosing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthClosing_userId_status_idx" ON "MonthClosing"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthClosing_userId_year_month_key" ON "MonthClosing"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_closingId_key" ON "Alert"("closingId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_closingId_fkey" FOREIGN KEY ("closingId") REFERENCES "MonthClosing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthClosing" ADD CONSTRAINT "MonthClosing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
