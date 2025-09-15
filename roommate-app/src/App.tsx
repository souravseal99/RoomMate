import "./App.css";
import UnauthenticatedLayout from "@/layouts/UnAuthenticatedLayout";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import useAuth from "./hooks/useAuth";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import DummyDashboard from "./layouts/DummyDashboard";
import ErrorPage from "./ErrorPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";

function App() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "RoomMate - Manage Your Shared Living Space";
    console.log("Is Authenticated:", isAuthenticated);
  });

  return (
    <Routes>
      {/* Unauthenticated routes */}
      <Route element={<UnauthenticatedLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated routes */}
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DummyDashboard />} />
        <Route path="/chores" element={<div>Chores</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
