import { Chore } from "@generated/prisma";
import ChoreDto from "@src/common/dtos/ChoreDto";
import prisma from "@src/common/utils/prisma";
import UpdateChoreType from "@src/chore/types/UpdateChoreType";

export class ChoreRepo {
  static async create(addChoreRequest: ChoreDto) {
    return await prisma.chore.create({
      data: addChoreRequest as Chore,
    });
  }

  static async update(updateChoreRequest: UpdateChoreType) {
    return await prisma.chore.update({
      where: { choreId: updateChoreRequest.choreId },
      data: updateChoreRequest,
      include: { assignedTo: { select: { userId: true, name: true } } },
    });
  }

  static async getChoreWithUser(choreId: string) {
    return await prisma.chore.findUnique({
      where: { choreId: choreId },
      include: { assignedTo: { select: { userId: true, name: true } } },
    });
  }
}
