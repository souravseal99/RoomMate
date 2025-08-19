import { Router } from "express";
import UserController from "@src/users/UserController";

const userRouter = Router();

userRouter.get("/", UserController.getUsers);

export default userRouter;
