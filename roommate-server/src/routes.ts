import { Router } from "express";
import userRoutes from "@src/users/user.routes";
import authRoutes from "@src/auth/auth.routes";
//NOTE - common syntex for routes
// routes.use('/path', middleware, specificActionsOnThePath);

const routes = Router();

routes.get("/health", (_request, response) =>
  response.json({
    dateTime: new Date(),
  })
);

routes.use("/user", userRoutes);

routes.use("/auth", authRoutes);

export default routes;
