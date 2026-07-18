import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { AppRole } from "./types";

export default function RequireRole({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const { loading, role: currentRole, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-20 text-center" style={{ color: "var(--muted)" }}>
        <div className="inline-flex items-center gap-2 card px-4 py-2">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (currentRole !== role) {
    return <Navigate to="/patient" replace />;
  }

  return <>{children}</>;
}