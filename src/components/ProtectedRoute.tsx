import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function RecoveryRoute({ children }: { children: ReactNode }) {
  const { isPasswordRecovery, authChecked } = useAuth();

  if (!authChecked) return null;

  if (!isPasswordRecovery) {
    return <Navigate to="/" replace />;
  }

  return children;
}