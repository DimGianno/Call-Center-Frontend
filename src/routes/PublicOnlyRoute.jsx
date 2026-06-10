import { Navigate } from "react-router-dom";

function PublicOnlyRoute({ children, isAuthReady, session }) {
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
