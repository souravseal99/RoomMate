import App from "@src/App";
import cors from "cors";
import express from "express";

const app = express();

// Add CORS middleware before your routes
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

async function start(): Promise<void> {
  // const appInitialized = await app.init(); // should setup inital works like DB connection check, (migrations, seeders)*
  const appInitialized = true;

  if (appInitialized) {
    const server = await App.start();
    const port = Number(process.env.PORT || process.env.APP_PORT || 5000);

    server.listen(port, "0.0.0.0", () => {
      console.log(
        `info: Roommate App: Server started on port:${port} (0.0.0.0)`,
      );
    });
  } else {
    console.log(`critical: Could not initialize app so that start could occur`);
  }
}

start();
