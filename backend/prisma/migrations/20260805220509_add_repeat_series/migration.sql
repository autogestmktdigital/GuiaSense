-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "seriesId" TEXT,
ADD COLUMN     "seriesIndex" INTEGER,
ADD COLUMN     "seriesTotal" INTEGER;

-- CreateIndex
CREATE INDEX "Transaction_userId_seriesId_idx" ON "Transaction"("userId", "seriesId");
