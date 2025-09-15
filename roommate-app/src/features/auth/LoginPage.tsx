// src/features/auth/LoginPage.tsx
import { useNavigate } from "react-router-dom";
import { AuthForm } from "./AuthForm";
import { loginUser } from "./api";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";

export default function LoginPage() {
  const nav = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const onSubmit = async (values: any) => {
    try {
      const res = await loginUser(values);

      const token = res.data?.accessToken;
      console.log(
        "Login response:",
        token,
        "\nisAuthenticated: ",
        isAuthenticated
      );
      if (token) {
        login(token, res.data?.email ?? null);
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
