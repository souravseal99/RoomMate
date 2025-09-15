import express, { type Express } from "express";
import { createServer, Server as HTTPServer } from "http";
import morgan from "morgan";
import routes from "@src/routes";
import errorHandler from "@common/middlewares/errorHandlder";
import validationErrorHandler from "@common/middlewares/validationErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";

// This should provide necessary methods to run an app
class App {
  app: Express;

  server: HTTPServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
  }

  async start(): Promise<HTTPServer> {
    // register controller routes
    this.middlewares();

    // CORS configuration
    const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

    this.app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Routes
    this.routes();

    // Validation middleware
    this.app.use(validationErrorHandler);

    // Global error middleware
    this.app.use(errorHandler);

    console.log(
      "info: Roommate App: Starting...enabling routing and middleware then continuing..."
    );

    return this.server;
  }

  routes(): void {
    this.app.use(routes);
  }

  middlewares(): void {
    //NOTE - Logger middleware
    this.app.use(morgan("dev"));

    //NOTE - req body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    //NOTE - cookie parser
    this.app.use(cookieParser());
  }
}

export default new App();
