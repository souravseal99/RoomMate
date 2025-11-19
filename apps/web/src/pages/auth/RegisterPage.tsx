// src/features/auth/RegisterPage.tsx
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../components/auth/AuthForm";
import { registerUser } from "../../api/authApi";
import useAuth from "@/hooks/useAuth";
import TokenStore from "@/lib/TokenStore";

export default function RegisterPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (values: any) => {
    try {
      // Ensure session ID exists before register
      TokenStore.getSessionId();
      const res = await registerUser(values);
      const token = res.data?.accessToken;
      if (token) {
        login(token, res.data?.email ?? null, res.data?.name ?? null);
        nav("/dashboard");
      }
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Registration failed");
    }
  };

  return <AuthForm mode="register" onSubmit={onSubmit} />;
}
