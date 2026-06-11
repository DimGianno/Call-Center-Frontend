import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { Theme } from "./types";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import useAuthSession from "./hooks/useAuthSession";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const [theme, setTheme] = useState<Theme>("dark");
  const auth = useAuthSession();
  const formattedRemainingSessionTime = formatSessionTime(auth.remainingSessionSeconds);

  function handleToggleTheme() {
    setTheme((currentTheme) => {
      return currentTheme === "dark" ? "light" : "dark";
    });
  }

  return (
    <div className="app" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage onToggleTheme={handleToggleTheme} session={auth.session} theme={theme} />
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute isAuthReady={auth.isAuthReady} session={auth.session}>
              <AuthPage
                mode="login"
                notice={auth.authNotice}
                onLogin={auth.handleLogin}
                onToggleTheme={handleToggleTheme}
                onSignup={auth.handleSignup}
                theme={theme}
              />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute isAuthReady={auth.isAuthReady} session={auth.session}>
              <AuthPage
                mode="signup"
                notice={auth.authNotice}
                onLogin={auth.handleLogin}
                onToggleTheme={handleToggleTheme}
                onSignup={auth.handleSignup}
                theme={theme}
              />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthReady={auth.isAuthReady} session={auth.session}>
              <DashboardPage
                formattedRemainingSessionTime={formattedRemainingSessionTime}
                onLogout={auth.handleLogout}
                onRefreshSessionTimer={auth.handleRefreshSessionTimer}
                onToggleTheme={handleToggleTheme}
                session={auth.session!}
                theme={theme}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function formatSessionTime(totalSeconds: number) {
  const safeTotalSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeTotalSeconds / 60);
  const seconds = safeTotalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default App;
