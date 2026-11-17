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
  if (input.includes("-") || input.includes("T")) {
    const directDate = new Date(input);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
  }
  const parsedDate = parse(input, "dd/MM/yyyy", new Date());
  if (isNaN(parsedDate.getTime())) {
    const fallback = new Date(input);
    if (!isNaN(fallback.getTime())) {
      return fallback;
    }
  }
  return new Date(
    Date.UTC(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
    ),
  );
};
