export default interface ExpenseDto {
  paidById: string;
  householdId: string;
  amount: number;
  description?: string;
}
