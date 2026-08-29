import { Navigate, Route, Routes } from 'react-router-dom';
import UnauthenticatedLayout from '@/layouts/UnAuthenticatedLayout';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import HouseholdGuard from '@/components/routing/HouseholdGuard';
import RegisterPage from '@/pages/auth/RegisterPage';
import LoginPage from '@/pages/auth/LoginPage';
import Dashboard from '@/pages/dashboard/Dashboard';
import Households from '@/pages/households/Households';
import Chores from '@/pages/chores/Chores';
import Expenses from '@/pages/expenses/Expenses';
import ErrorPage from '@/pages/ErrorPage';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import Inventory from '@/pages/inventory/Inventory';
import { InventoryProvider } from '@/contexts/InventoryContext';

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
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        {/* Base accessible authenticated route (Onboarding & Workspace Management) */}
        <Route path="/households" element={<Households />} />

        {/* Feature routes protected by HouseholdGuard (Enforces active household) */}
        <Route element={<HouseholdGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chores" element={<Chores />} />
          <Route
            path="/expenses"
            element={
              <ExpenseProvider>
                <Expenses />
              </ExpenseProvider>
            }
          />
          <Route
            path="/inventory"
            element={
              <InventoryProvider>
                <Inventory />
              </InventoryProvider>
            }
          />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default AppRouter;
