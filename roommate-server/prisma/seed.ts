import { PrismaClient, Role } from "@generated/prisma";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Helper function to read JSON seed files
function loadSeedData<T>(fileName: string): T {
  const filePath = path.join(__dirname, "seeds", fileName);
  const rawData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawData) as T;
}

interface UserSeed {
  userId: string;
  name: string;
  email: string;
  password: string;
}

interface HouseholdMemberSeed {
  userId: string;
  role: "ADMIN" | "MEMBER";
}

interface HouseholdSeed {
  householdId: string;
  name: string;
  inviteCode: string;
  members: HouseholdMemberSeed[];
}

interface ExpenseSplitSeed {
  userId: string;
  shareAmount: number;
}

interface ExpenseSeed {
  expenseId: string;
  description: string;
  amount: number;
  householdId: string;
  paidById: string;
  splits: ExpenseSplitSeed[];
}

interface ChoreSeed {
  choreId: string;
  description: string;
  frequency: string;
  daysFromNow: number;
  completed: boolean;
  priority?: string;
  notes?: string;
  householdId: string;
  assignedToId?: string;
}

interface InventoryItemSeed {
  inventoryItemId: string;
  name: string;
  quantity: number;
  lowThreshold: number;
  householdId: string;
}

interface ShoppingCartSeed {
  shoppingCartId: string;
  itemName: string;
  quantity: number;
  householdId: string;
}

interface SettlementSeed {
  settlementId: string;
  amount: number;
  fromUserId: string;
  toUserId: string;
  householdId: string;
}

export interface SeedOptions {
  clean?: boolean;
  force?: boolean;
}

/**
 * Validates that seeding is safe to run against the current database.
 */
function assertSafetyGuard(force = false) {
  const dbUrl = process.env.DATABASE_URL || "";
  const isProdEnv = process.env.NODE_ENV === "production";

  const dangerousHostMarkers = [
    "render.com",
    "supabase.co",
    "aws.com",
    "neon.tech",
    "railway.app",
    "elephantsql.com",
    "planetscale.com",
  ];

  const pointsToRemoteProduction = dangerousHostMarkers.some((marker) =>
    dbUrl.toLowerCase().includes(marker),
  );

  if ((isProdEnv || pointsToRemoteProduction) && !force) {
    console.error("\n❌ SAFETY ERROR: Refusing to seed database!");
    console.error("---------------------------------------------------------");
    console.error(`Target DATABASE_URL appears to be a remote or production database.`);
    console.error(`NODE_ENV: "${process.env.NODE_ENV}"`);
    console.error(`To bypass this guard, pass --force explicitly.\n`);
    throw new Error("Seeder aborted by Production Safety Guard");
  }
}

export async function seedDatabase(options: SeedOptions = {}) {
  const clean = options.clean ?? true;
  const force = options.force ?? false;

  assertSafetyGuard(force);

  console.log(`\n🌱 Starting Database Seeding [Mode: ${clean ? "Clean Wipe & Re-seed" : "Idempotent Upsert"}]...`);

  // 1. Clean existing records if requested
  if (clean) {
    console.log("🧹 Cleaning existing database records...");
    await prisma.settlement.deleteMany({});
    await prisma.shoppingCart.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    await prisma.chore.deleteMany({});
    await prisma.expenseSplit.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.householdMember.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.household.deleteMany({});
    await prisma.user.deleteMany({});
  }

  // 2. Load JSON files from prisma/seeds/
  const users = loadSeedData<UserSeed[]>("users.json");
  const households = loadSeedData<HouseholdSeed[]>("households.json");
  const expenses = loadSeedData<ExpenseSeed[]>("expenses.json");
  const chores = loadSeedData<ChoreSeed[]>("chores.json");
  const inventoryItems = loadSeedData<InventoryItemSeed[]>("inventory.json");
  const shoppingCarts = loadSeedData<ShoppingCartSeed[]>("shoppingCarts.json");
  const settlements = loadSeedData<SettlementSeed[]>("settlements.json");

  // 3. Seed Users
  console.log(`👤 Processing ${users.length} users from users.json...`);
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { userId: user.userId },
      update: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
      create: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }

  // 4. Seed Households & Memberships
  console.log(`🏡 Processing ${households.length} households from households.json...`);
  for (const household of households) {
    await prisma.household.upsert({
      where: { householdId: household.householdId },
      update: {
        name: household.name,
        inviteCode: household.inviteCode,
      },
      create: {
        householdId: household.householdId,
        name: household.name,
        inviteCode: household.inviteCode,
      },
    });

    for (const member of household.members) {
      await prisma.householdMember.upsert({
        where: {
          userId_householdId: {
            userId: member.userId,
            householdId: household.householdId,
          },
        },
        update: {
          role: member.role as Role,
        },
        create: {
          userId: member.userId,
          householdId: household.householdId,
          role: member.role as Role,
        },
      });
    }
  }

  // 5. Seed Expenses & Splits
  console.log(`💰 Processing ${expenses.length} expenses from expenses.json...`);
  for (const expense of expenses) {
    await prisma.expense.upsert({
      where: { expenseId: expense.expenseId },
      update: {
        description: expense.description,
        amount: expense.amount,
        householdId: expense.householdId,
        paidById: expense.paidById,
      },
      create: {
        expenseId: expense.expenseId,
        description: expense.description,
        amount: expense.amount,
        householdId: expense.householdId,
        paidById: expense.paidById,
        splits: {
          create: expense.splits.map((s) => ({
            userId: s.userId,
            shareAmount: s.shareAmount,
          })),
        },
      },
    });
  }

  // 6. Seed Chores
  console.log(`🧹 Processing ${chores.length} chores from chores.json...`);
  const now = new Date();
  for (const chore of chores) {
    const nextDue = new Date(
      now.getTime() + chore.daysFromNow * 24 * 60 * 60 * 1000,
    );
    await prisma.chore.upsert({
      where: { choreId: chore.choreId },
      update: {
        description: chore.description,
        frequency: chore.frequency,
        nextDue,
        completed: chore.completed,
        priority: chore.priority,
        notes: chore.notes,
        householdId: chore.householdId,
        assignedToId: chore.assignedToId,
      },
      create: {
        choreId: chore.choreId,
        description: chore.description,
        frequency: chore.frequency,
        nextDue,
        completed: chore.completed,
        priority: chore.priority,
        notes: chore.notes,
        householdId: chore.householdId,
        assignedToId: chore.assignedToId,
      },
    });
  }

  // 7. Seed Inventory Items
  console.log(`📦 Processing ${inventoryItems.length} inventory items from inventory.json...`);
  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { inventoryItemId: item.inventoryItemId },
      update: {
        name: item.name,
        quantity: item.quantity,
        lowThreshold: item.lowThreshold,
        householdId: item.householdId,
      },
      create: {
        inventoryItemId: item.inventoryItemId,
        name: item.name,
        quantity: item.quantity,
        lowThreshold: item.lowThreshold,
        householdId: item.householdId,
      },
    });
  }

  // 8. Seed Shopping Cart Items
  console.log(`🛒 Processing ${shoppingCarts.length} shopping cart items from shoppingCarts.json...`);
  for (const cartItem of shoppingCarts) {
    await prisma.shoppingCart.upsert({
      where: { shoppingCartId: cartItem.shoppingCartId },
      update: {
        itemName: cartItem.itemName,
        quantity: cartItem.quantity,
        householdId: cartItem.householdId,
      },
      create: {
        shoppingCartId: cartItem.shoppingCartId,
        itemName: cartItem.itemName,
        quantity: cartItem.quantity,
        householdId: cartItem.householdId,
      },
    });
  }

  // 9. Seed Settlements
  console.log(`💳 Processing ${settlements.length} settlements from settlements.json...`);
  for (const settlement of settlements) {
    await prisma.settlement.upsert({
      where: { settlementId: settlement.settlementId },
      update: {
        amount: settlement.amount,
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        householdId: settlement.householdId,
      },
      create: {
        settlementId: settlement.settlementId,
        amount: settlement.amount,
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        householdId: settlement.householdId,
      },
    });
  }

  console.log("\n================================================================================");
  console.log("🏡 ROOMMATE DEV DATABASE SEEDED SUCCESSFULLY");
  console.log("================================================================================");
  console.log("Role    | Name            | Email                 | Password      | Household");
  console.log("--------+-----------------+-----------------------+---------------+-----------------");
  for (const user of users) {
    const memberHousehold = households.find((h) =>
      h.members.some((m) => m.userId === user.userId),
    );
    const membership = memberHousehold?.members.find((m) => m.userId === user.userId);
    const roleStr = membership?.role || "MEMBER";
    const houseName = memberHousehold?.name || "None";
    console.log(
      `${roleStr.padEnd(7)} | ${user.name.padEnd(15)} | ${user.email.padEnd(21)} | ${user.password.padEnd(13)} | ${houseName}`,
    );
  }
  console.log("--------------------------------------------------------------------------------");
  console.log("Household Invite Codes:");
  for (const h of households) {
    console.log(` • ${h.name.padEnd(20)} : ${h.inviteCode}`);
  }
  console.log("================================================================================\n");
}

seedDatabase({
  clean: !process.argv.includes("--idempotent"),
  force: process.argv.includes("--force") || process.argv.includes("--force-production-seed"),
})
  .catch((e) => {
    console.error("❌ Seeding execution failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
