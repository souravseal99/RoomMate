import ExpenseDto from "@src/common/dtos/ExpenseDto";

export interface BalanceEntry {
  userId: string;
  name: string;
  balance: number;
}

export interface Settlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export default function calculateBalance(expenses: ExpenseDto[]) {
  const balances: Record<
    string,
    { userId: string; name: string; balance: number }
  > = {};

  expenses.forEach((exp) => {
    const payer = exp?.paidBy;
    const payerId = payer?.userId as string;

    if (!balances[payerId]) {
      balances[payerId] = {
        userId: payerId,
        name: payer?.name as string,
        balance: 0,
      };
    }

    balances[payerId].balance += exp.amount;

    exp?.splits?.forEach((split) => {
      const u = split?.user;

      if (u) {
        if (!balances[u.userId]) {
          balances[u.userId] = { userId: u.userId, name: u.name, balance: 0 };
        }
        balances[u.userId].balance -= split.shareAmount;
      }
    });
  });

  return Object.values(balances);
}

export function calculateSettlements(balances: BalanceEntry[]): Settlement[] {
  const settlements: Settlement[] = [];
  
  // Create copies to work with
  const debtors = balances
    .filter((b) => b.balance < -0.01) // Negative balance = owes money
    .map((b) => ({ userId: b.userId, name: b.name, amount: Math.abs(b.balance) }))
    .sort((a, b) => b.amount - a.amount);
    
  const creditors = balances
    .filter((b) => b.balance > 0.01) // Positive balance = owed money
    .map((b) => ({ userId: b.userId, name: b.name, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);

  // Greedy algorithm: match biggest debtor with biggest creditor
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      });
    }
    
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}
