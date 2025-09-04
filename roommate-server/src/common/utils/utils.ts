import { Request } from "express";
import { parse } from "date-fns";

export const getUserFromRequestBody = (request: Request) => {
  const userId: string = request?.user?.userId || "";
  const userRole: string = request?.user?.role || "";

  return {
    userId: userId,
    userRole: userRole,
  };
};

export const parseDate = (input: string) => {
  const parsedDate = parse(input, "dd/MM/yyyy", new Date());
  return new Date(
    Date.UTC(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    )
  );
};
