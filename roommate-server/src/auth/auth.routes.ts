import { Router } from "express";
import { AuthController } from "@src/auth/auth.controller";
import { registerUserValidator } from "@src/auth/registerUserValidatior";
import { loginUserValidator } from "@src/auth/loginUserValidator";
import validationErrorHandler from "@common/middlewares/validationErrorHandler";

const authRoutes = Router();

authRoutes.post(
  "/register",
  ...registerUserValidator,
  validationErrorHandler,
  AuthController.register
);

authRoutes.post(
  "/login",
  ...loginUserValidator,
  validationErrorHandler,
  AuthController.login
);

authRoutes.get("/refresh", AuthController.refresh);

export default authRoutes;
