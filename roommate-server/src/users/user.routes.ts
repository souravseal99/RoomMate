import { Router } from "express";
import { UserController } from "@src/users/user.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const userRouter = Router();

//NOTE - Protected Routes
userRouter.get("/profile", ensureAuthenticated, UserController.profile);
userRouter.patch("/profile", ensureAuthenticated, UserController.updateProfile);

export default userRouter;

