import { Router } from "express";
import { AuthController } from "@src/auth/auth.controller";
import { registerUserValidator } from "@src/auth/registerUserValidatior";
import { loginUserValidator } from "@src/auth/loginUserValidator";
import validationErrorHandler from "@common/middlewares/validationErrorHandler";
import { generateCsrfToken } from "@common/middlewares/csrf";
import { StatusCodes } from "http-status-codes";
import {
  authAccountLimiter,
  authIpLimiter,
  authRegisterLimiter,
  csrfTokenLimiter,
  authRefreshLimiter,
} from "@common/middlewares/rateLimiter";

const authRoutes = Router();

authRoutes.get("/csrf-token", csrfTokenLimiter, (request, response) => {
  const csrfToken = generateCsrfToken(request, response);
  return response.status(StatusCodes.OK).json({
    csrfToken,
  });
});

authRoutes.post(
  "/register",
  authRegisterLimiter,
  ...registerUserValidator,
  validationErrorHandler,
  AuthController.register,
);

authRoutes.post(
  "/login",
  authAccountLimiter,
  authIpLimiter,
  ...loginUserValidator,
  validationErrorHandler,
  AuthController.login,
);

authRoutes.get("/refresh", authRefreshLimiter, AuthController.refresh);

authRoutes.get("/logout", AuthController.logout);

export default authRoutes;
