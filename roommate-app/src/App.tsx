import { useEffect } from "react";
import AppRouter from "@/router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/App.css";

function App() {
  useEffect(() => {
    document.title = "RoomMate - Manage Your Shared Living Space";
  });

  return (
    <ThemeProvider>
      <AppRouter />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
