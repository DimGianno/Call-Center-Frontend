import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AuthSession } from "../types";

interface PublicOnlyRouteProps {
  children: ReactNode;
  session: AuthSession | null;
}

function PublicOnlyRoute({ children, session }: PublicOnlyRouteProps) {
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicOnlyRoute;
