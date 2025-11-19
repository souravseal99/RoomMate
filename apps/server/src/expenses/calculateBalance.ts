import ExpenseDto from "@src/common/dtos/ExpenseDto";

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
