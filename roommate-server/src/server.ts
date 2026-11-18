import "dotenv/config"; // To explicitly load .env the moment this file is loaded
import App from "@src/App";
import { env } from "@src/common/utils/env";

async function start(): Promise<void> {
  const appInitialized = true;

  if (appInitialized) {
    const server = await App.start();

    server.listen(env("APP_PORT"), () => {
      console.log(
        `info: Roommate App: Server started on port:${env("APP_PORT")}`,
      );
    });
  } else {
    console.log(`critical: Could not initialize app so that start could occur`);
  }
}

start();
