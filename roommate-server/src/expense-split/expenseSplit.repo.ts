import ExpenseSplitDto from "@src/common/dtos/ExpenseSplitDto";
import prisma from "@src/common/utils/prisma";

export class ExpenseSplitRepo {
  static async bulkCreate(expenseSplits: ExpenseSplitDto[]) {
    return await prisma.expenseSplit.createMany({
      data: expenseSplits,
    });
  }
}
