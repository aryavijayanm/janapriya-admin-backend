/*
  Warnings:

  - You are about to drop the column `is_active` on the `Staff` table. All the data in that column has already been migrated into `status`.
  - Made the column `status` on table `Staff` required and set its default.

*/
-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Staff" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
ALTER TABLE "Staff" DROP COLUMN "is_active";
