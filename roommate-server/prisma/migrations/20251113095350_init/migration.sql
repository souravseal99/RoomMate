-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Household" (
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("household_id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "household_member_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("household_member_id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "expense_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "household_id" TEXT NOT NULL,
    "paid_by_id" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "ExpenseSplit" (
    "expense_split_id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shareAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExpenseSplit_pkey" PRIMARY KEY ("expense_split_id")
);

-- CreateTable
CREATE TABLE "Chore" (
    "chore_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextDue" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT DEFAULT 'MEDIUM',
    "notes" TEXT,
    "household_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,

    CONSTRAINT "Chore_pkey" PRIMARY KEY ("chore_id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "inventory_item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lowThreshold" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "household_id" TEXT NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("inventory_item_id")
);

-- CreateTable
CREATE TABLE "ShoppingCart" (
    "shopping_cart_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "household_id" TEXT NOT NULL,

    CONSTRAINT "ShoppingCart_pkey" PRIMARY KEY ("shopping_cart_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Household_inviteCode_key" ON "Household"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_user_id_household_id_key" ON "HouseholdMember"("user_id", "household_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseSplit_expense_id_user_id_key" ON "ExpenseSplit"("expense_id", "user_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "Expense"("expense_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;
