import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AuthSession } from "../types";

interface PublicOnlyRouteProps {
  children: ReactNode;
  isAuthReady: boolean;
  session: AuthSession | null;
}

function PublicOnlyRoute({ children, isAuthReady, session }: PublicOnlyRouteProps) {
  if (!isAuthReady) {
    return (
      <main className="auth-page">
        <div className="auth-panel">
          <div className="empty-state">
            <p>Loading session...</p>
          </div>
        </div>
      </main>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicOnlyRoute;
