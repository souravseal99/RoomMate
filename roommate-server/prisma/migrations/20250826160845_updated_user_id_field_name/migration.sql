/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The required column `user_id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."HouseholdMember" DROP CONSTRAINT "HouseholdMember_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");

-- AddForeignKey
ALTER TABLE "public"."HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
