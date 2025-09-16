import { useEffect } from "react";
import AppRouter from "@/router";
import "@/App.css";

function App() {
  useEffect(() => {
    document.title = "RoomMate - Manage Your Shared Living Space";
  });

  return <AppRouter />;
}

export default App;
