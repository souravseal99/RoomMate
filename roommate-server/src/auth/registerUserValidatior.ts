// src/validators/authValidators.ts
import { body, ValidationChain } from "express-validator";

export const registerUserValidator: ValidationChain[] = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Enter your full name"),

  body("email").isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];
