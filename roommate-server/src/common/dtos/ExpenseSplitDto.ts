import { User } from "@generated/prisma";

export default interface ExpenseSplitDto {
  expenseId: string;
  userId: string;
  shareAmount: number;
  user?: User;
}
