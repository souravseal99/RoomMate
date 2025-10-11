import { useEffect } from "react";
import AppRouter from "@/router";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

function App() {
  useEffect(() => {
    document.title = "RoomMate - Manage Your Shared Living Space";
  });

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
