import ErrorPage from "@/ErrorPage";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import { Navigate, Route, Routes } from "react-router-dom";

function UnauthenticatedRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Fallback Route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}

export default UnauthenticatedRoutes;
