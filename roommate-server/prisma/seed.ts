import { PrismaClient, Role } from '@generated/prisma';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper function to read JSON seed files
function loadSeedData<T>(fileName: string): T {
  const filePath = path.join(__dirname, 'seeds', fileName);
  const rawData = fs.readFileSync(filePath, 'utf-8');
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
  role: 'ADMIN' | 'MEMBER';
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

async function main() {
  console.log('🌱 Starting JSON-driven database seeding...');

  // 1. Clean existing records (in reverse dependency order)
  console.log('🧹 Cleaning existing database records...');
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

  // 2. Load JSON files from prisma/seeds/
  const users = loadSeedData<UserSeed[]>('users.json');
  const households = loadSeedData<HouseholdSeed[]>('households.json');
  const expenses = loadSeedData<ExpenseSeed[]>('expenses.json');
  const chores = loadSeedData<ChoreSeed[]>('chores.json');
  const inventoryItems = loadSeedData<InventoryItemSeed[]>('inventory.json');
  const shoppingCarts = loadSeedData<ShoppingCartSeed[]>('shoppingCarts.json');
  const settlements = loadSeedData<SettlementSeed[]>('settlements.json');

  // 3. Seed Users
  console.log(`👤 Seeding ${users.length} users from users.json...`);
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
  }

  // 4. Seed Households & Memberships
  console.log(`🏡 Seeding ${households.length} households from households.json...`);
  for (const household of households) {
    await prisma.household.create({
      data: {
        householdId: household.householdId,
        name: household.name,
        inviteCode: household.inviteCode,
        members: {
          create: household.members.map((m) => ({
            userId: m.userId,
            role: m.role as Role,
          })),
        },
      },
    });
  }

  // 5. Seed Expenses & Splits
  console.log(`💰 Seeding ${expenses.length} expenses from expenses.json...`);
  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
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
  console.log(`🧹 Seeding ${chores.length} chores from chores.json...`);
  const now = new Date();
  for (const chore of chores) {
    const nextDue = new Date(now.getTime() + chore.daysFromNow * 24 * 60 * 60 * 1000);
    await prisma.chore.create({
      data: {
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
  console.log(`📦 Seeding ${inventoryItems.length} inventory items from inventory.json...`);
  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        inventoryItemId: item.inventoryItemId,
        name: item.name,
        quantity: item.quantity,
        lowThreshold: item.lowThreshold,
        householdId: item.householdId,
      },
    });
  }

  // 8. Seed Shopping Cart Items
  console.log(`🛒 Seeding ${shoppingCarts.length} shopping cart items from shoppingCarts.json...`);
  for (const cartItem of shoppingCarts) {
    await prisma.shoppingCart.create({
      data: {
        shoppingCartId: cartItem.shoppingCartId,
        itemName: cartItem.itemName,
        quantity: cartItem.quantity,
        householdId: cartItem.householdId,
      },
    });
  }

  // 9. Seed Settlements
  console.log(`💳 Seeding ${settlements.length} settlements from settlements.json...`);
  for (const settlement of settlements) {
    await prisma.settlement.create({
      data: {
        settlementId: settlement.settlementId,
        amount: settlement.amount,
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        householdId: settlement.householdId,
      },
    });
  }

  console.log('✅ JSON-driven database seeding completed successfully!');
  console.log('\n🔐 Pre-configured Test Accounts (from prisma/seeds/users.json):');
  console.log('----------------------------------------------------');
  for (const user of users) {
    console.log(`• ${user.name.padEnd(16)} : ${user.email.padEnd(20)} / ${user.password}`);
  }
  console.log('----------------------------------------------------');
  console.log('💡 Dev Tip: Edit any JSON file in `prisma/seeds/` to customize test data!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
