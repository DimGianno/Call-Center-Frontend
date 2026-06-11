import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { AuthSession } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthReady: boolean;
  session: AuthSession | null;
}

function ProtectedRoute({ children, isAuthReady, session }: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <main className="dashboard">
        <div className="empty-state">
          <p>Loading session...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
