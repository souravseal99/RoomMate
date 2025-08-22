import { Router } from "express";
import AuthController from "@src/auth/auth.controller";
import { registerUserValidator } from "@src/auth/registerUserValidatior";
import validationErrorHandler from "@common/middlewares/validationErrorHandler";

const authRoutes = Router();

authRoutes.get("/test", AuthController.testAuthRoute);
authRoutes.get("/", AuthController.testAuthRoute2);
authRoutes.post(
  "/register",
  ...registerUserValidator,
  validationErrorHandler,
  AuthController.register
);

export default authRoutes;
