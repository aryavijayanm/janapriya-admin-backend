/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Made the column `abbreviation` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "abbreviation" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Service_abbreviation_key" ON "Service"("abbreviation");
