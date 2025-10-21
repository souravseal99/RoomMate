import ExpenseSplitDto from "@common/dtos/ExpenseSplitDto";
import UserDto from "@common/dtos//UserDto";

export default interface ExpenseDto {
  householdId: string;
  paidById: string;
  amount: number;
  description?: string;
  category?: string;
  paidBy?: UserDto;
  splits?: ExpenseSplitDto[];
}
