import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useEffect, type JSX } from "react";

export default function ProtectedRoute({
  children,
}: Readonly<{
  children: JSX.Element;
}>) {
  const { ready, isAuthenticated } = useAuth();
  useEffect(() => {
    console.log(
      "ProtectedRoute - ready:",
      ready,
      " accessToken:",
      isAuthenticated
    );
  }, [ready, isAuthenticated]);

  if (!ready) return <div className="p-6">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
