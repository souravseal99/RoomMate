// src/features/auth/LoginPage.tsx
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../components/auth/AuthForm";
import { loginUser } from "../../api/authApi";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import TokenStore from "@/lib/TokenStore";

export default function LoginPage() {
  const nav = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const onSubmit = async (values: any) => {
    try {
      // Ensure session ID exists before login
      TokenStore.getSessionId();
      const res = await loginUser(values);

      const token = res.data?.accessToken;
      console.log(
        "Login response:",
        token,
        "\nisAuthenticated: ",
        isAuthenticated
      );
      if (token) {
        login(token, res.data?.email ?? null, res.data?.name ?? null);
      }
    } catch (e: any) {
      console.error("Login failed: ", e);
      alert(e.response?.data?.message ?? "Login failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      nav("/dashboard");
    }
  }, [isAuthenticated, nav]);

  return <AuthForm mode="login" onSubmit={onSubmit} />;
}
