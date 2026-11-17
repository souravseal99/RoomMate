import prisma from "@common/utils/prisma";

export class SessionRepo {
  static async createSession(
    sessionId: string,
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ) {
    return await prisma.session.create({
      data: { sessionId, userId, refreshToken, expiresAt },
    });
  }

  static async getSession(sessionId: string) {
    return await prisma.session.findUnique({
      where: { sessionId },
      include: { user: true },
    });
  }

  static async updateSession(
    sessionId: string,
    refreshToken: string,
    expiresAt: Date,
    prevRefreshToken?: string,
    rotatedAt?: Date,
  ) {
    return await prisma.session.update({
      where: { sessionId },
      data: {
        refreshToken,
        expiresAt,
        ...(prevRefreshToken !== undefined && { prevRefreshToken }),
        ...(rotatedAt !== undefined && { rotatedAt }),
      },
    });
  }

  static async deleteSession(sessionId: string) {
    return await prisma.session.delete({
      where: { sessionId },
    });
  }

  static async deleteUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  }

  static async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: {
        sessionId: true,
        userId: true,
        createdAt: true,
        expiresAt: true,
        rotatedAt: true,
      },
    });
  }

  static async deleteOtherSessions(userId: string, currentSessionId?: string) {
    return await prisma.session.deleteMany({
      where: {
        userId,
        ...(currentSessionId ? { sessionId: { not: currentSessionId } } : {}),
      },
    });
  }
}
