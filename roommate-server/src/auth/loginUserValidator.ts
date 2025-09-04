// src/validators/authValidators.ts
import { body, ValidationChain } from "express-validator";

export const loginUserValidator: ValidationChain[] = [
  body("email").isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];
