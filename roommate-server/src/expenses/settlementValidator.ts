import { body } from "express-validator";

export const settlementValidator = [
  body("householdId").trim().notEmpty().withMessage("Household ID is required"),
  body("toUserId")
    .trim()
    .notEmpty()
    .withMessage("Recipient user ID (toUserId) is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Settlement amount must be a number greater than 0"),
];
