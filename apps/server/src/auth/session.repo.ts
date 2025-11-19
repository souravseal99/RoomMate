import prisma from "@common/utils/prisma";

export class SessionRepo {
  static async createSession(sessionId: string, userId: string, refreshToken: string, expiresAt: Date) {
    return await prisma.session.create({
      data: { sessionId, userId, refreshToken, expiresAt }
    });
  }

  static async getSession(sessionId: string) {
    return await prisma.session.findUnique({
      where: { sessionId },
      include: { user: true }
    });
  }

  static async deleteSession(sessionId: string) {
    return await prisma.session.delete({
      where: { sessionId }
    });
  }

  static async deleteUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId }
    });
  }
}
