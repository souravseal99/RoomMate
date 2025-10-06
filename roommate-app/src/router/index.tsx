import { Navigate, Route, Routes } from "react-router-dom";
import UnauthenticatedLayout from "@/layouts/UnAuthenticatedLayout";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";
import DummyDashboard from "@/pages/dashboard/DummyDashboard";
import Households from "@/pages/households/Households";
import Expenses from "@/pages/expenses/Expenses";
import ErrorPage from "@/pages/ErrorPage";
import HouseholdProvider from "@/contexts/HouseholdContext";

function AppRouter() {
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
            <HouseholdProvider>
              <AuthenticatedLayout />
            </HouseholdProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DummyDashboard />} />
        <Route path="/chores" element={<div>Chores</div>} />

        <Route path="/households" element={<Households />} />
        <Route path="/expenses" element={<Expenses />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default AppRouter;
