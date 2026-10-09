-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'DISABLED', 'DELETED');

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "status" "StaffStatus";
