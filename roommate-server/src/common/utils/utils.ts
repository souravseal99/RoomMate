import { Request } from "express";

export const getUserFromRequestBody = (request: Request) => {
  const userId: string = request?.user?.userId || "";
  const userRole: string = request?.user?.role || "";

  return {
    userId: userId,
    userRole: userRole,
  };
};
