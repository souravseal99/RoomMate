import { Router } from "express";
import { UserController } from "@src/users/user.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const userRouter = Router();

//NOTE - Protected Routes
userRouter.get("/all", ensureAuthenticated, UserController.getUsers);
userRouter.get("/profile", ensureAuthenticated, UserController.profile);

export default userRouter;
