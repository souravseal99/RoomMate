import ExpenseSplitDto from "@src/common/dtos/ExpenseSplitDto";
import { ExpenseSplitRepo } from "@src/expense-split/expenseSplit.repo";

export class ExpenseSplitService {
  static async bulkCreate(expenseSplits: ExpenseSplitDto[]) {
    return await ExpenseSplitRepo.bulkCreate(expenseSplits);
  }
}
