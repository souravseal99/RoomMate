import express, { type Express } from "express";
import { createServer, Server as HTTPServer } from "http";
import routes from "@src/routes";

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
    this.routes();

    console.log(
      "info: Roommate App: Starting...enabling routing and middleware then continuing..."
    );

    return this.server;
  }

  routes(): void {
    this.app.use(routes);
  }
}

export default new App();
