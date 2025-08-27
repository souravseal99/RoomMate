import { Router } from "express";
import UserController from "@src/users/user.controller";
import userController from "@src/users/user.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const userRouter = Router();

//NOTE - Protected Route
userRouter.get("/profile", ensureAuthenticated, userController.profile);

export default userRouter;
