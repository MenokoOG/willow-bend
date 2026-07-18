import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Role } from "../types/roles";

interface Props {
  children: JSX.Element;
  allow?: Role[];
}

export default function ProtectedRoute({ children, allow }: Props) {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="p-8">Loading…</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allow && role && !allow.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
