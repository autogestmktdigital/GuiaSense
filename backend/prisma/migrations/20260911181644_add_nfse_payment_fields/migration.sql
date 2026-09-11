-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "nfeEmittedAt" TIMESTAMP(3),
ADD COLUMN     "nfeMessage" TEXT,
ADD COLUMN     "nfeNumber" TEXT,
ADD COLUMN     "nfeRef" TEXT,
ADD COLUMN     "nfeStatus" TEXT,
ADD COLUMN     "nfeUrl" TEXT;
