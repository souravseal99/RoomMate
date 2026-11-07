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
    const dataToUpdate = { ...updateChoreRequest };
    if (
      dataToUpdate.completed === true &&
      dataToUpdate.completedAt === undefined
    ) {
      dataToUpdate.completedAt = new Date();
    } else if (
      dataToUpdate.completed === false &&
      dataToUpdate.completedAt === undefined
    ) {
      dataToUpdate.completedAt = null;
    }

    return await prisma.chore.update({
      where: { choreId: updateChoreRequest.choreId },
      data: dataToUpdate,
      include: {
        assignedTo: { select: { userId: true, name: true, email: true } },
      },
    });
  }

  static async getChoreWithUser(choreId: string) {
    return await prisma.chore.findUnique({
      where: { choreId: choreId },
      include: {
        assignedTo: { select: { userId: true, name: true, email: true } },
      },
    });
  }

  static async getByHousehold(householdId: string) {
    return await prisma.chore.findMany({
      where: { householdId },
      include: {
        assignedTo: { select: { userId: true, name: true, email: true } },
      },
      orderBy: { nextDue: "asc" },
    });
  }

  static async delete(choreId: string) {
    return await prisma.chore.delete({
      where: { choreId },
    });
  }
}
