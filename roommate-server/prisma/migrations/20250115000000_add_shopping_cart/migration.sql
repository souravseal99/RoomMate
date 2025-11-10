-- CreateTable
CREATE TABLE "ShoppingCart" (
    "shopping_cart_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "household_id" TEXT NOT NULL,

    CONSTRAINT "ShoppingCart_pkey" PRIMARY KEY ("shopping_cart_id")
);

-- AddForeignKey
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "Household"("household_id") ON DELETE RESTRICT ON UPDATE CASCADE;