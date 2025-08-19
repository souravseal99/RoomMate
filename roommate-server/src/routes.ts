import { Router } from "express";
import userRoutes from "./users/userRoutes";
//NOTE - common syntex for routes
// routes.use('/path', middleware, specificActionsOnThePath);

const routes = Router();

routes.use("/user", userRoutes);

routes.get("/health", (_request, response) =>
  response.json({
    dateTime: new Date(),
  })
);

export default routes;
