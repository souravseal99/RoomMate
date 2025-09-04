/*
  Warnings:

  - The primary key for the `Household` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Household` table. All the data in the column will be lost.
  - The primary key for the `HouseholdMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `householdId` on the `HouseholdMember` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `HouseholdMember` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `HouseholdMember` table. All the data in the column will be lost.
  - The `role` column on the `HouseholdMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id,household_id]` on the table `HouseholdMember` will be added. If there are existing duplicate values, this will fail.
  - The required column `household_id` was added to the `Household` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `household_id` to the `HouseholdMember` table without a default value. This is not possible if the table is not empty.
  - The required column `household_member_id` was added to the `HouseholdMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id` to the `HouseholdMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MEMBER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."HouseholdMember" DROP CONSTRAINT "HouseholdMember_householdId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HouseholdMember" DROP CONSTRAINT "HouseholdMember_userId_fkey";

-- DropIndex
DROP INDEX "public"."HouseholdMember_userId_householdId_key";

-- AlterTable
ALTER TABLE "public"."Household" DROP CONSTRAINT "Household_pkey",
DROP COLUMN "id",
ADD COLUMN     "household_id" TEXT NOT NULL,
ADD CONSTRAINT "Household_pkey" PRIMARY KEY ("household_id");

-- AlterTable
ALTER TABLE "public"."HouseholdMember" DROP CONSTRAINT "HouseholdMember_pkey",
DROP COLUMN "householdId",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "household_id" TEXT NOT NULL,
ADD COLUMN     "household_member_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'MEMBER',
ADD CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("household_member_id");

-- CreateTable
CREATE TABLE "public"."Expense" (
    "expense_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "household_id" TEXT NOT NULL,
    "paid_by_id" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "public"."ExpenseSplit" (
    "expense_split_id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shareAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExpenseSplit_pkey" PRIMARY KEY ("expense_split_id")
);

-- CreateTable
CREATE TABLE "public"."Chore" (
    "chore_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextDue" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "household_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,

    CONSTRAINT "Chore_pkey" PRIMARY KEY ("chore_id")
);

-- CreateTable
CREATE TABLE "public"."InventoryItem" (
    "inventory_item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lowThreshold" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "household_id" TEXT NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("inventory_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSplit_expense_id_user_id_key" ON "public"."ExpenseSplit"("expense_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_user_id_household_id_key" ON "public"."HouseholdMember"("user_id", "household_id");

-- AddForeignKey
ALTER TABLE "public"."HouseholdMember" ADD CONSTRAINT "HouseholdMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HouseholdMember" ADD CONSTRAINT "HouseholdMember_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expense" ADD CONSTRAINT "Expense_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."Expense"("expense_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chore" ADD CONSTRAINT "Chore_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chore" ADD CONSTRAINT "Chore_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryItem" ADD CONSTRAINT "InventoryItem_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "public"."Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;
