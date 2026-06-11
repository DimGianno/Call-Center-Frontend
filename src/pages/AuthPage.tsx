import { useNavigate } from "react-router-dom";
import type { AuthMode, LoginCredentials, SignupCredentials, Theme } from "../types";
import AuthScreen from "../components/AuthScreen";

interface AuthPageProps {
  mode: AuthMode;
  notice: string;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onSignup: (credentials: SignupCredentials) => Promise<void>;
  onToggleTheme: () => void;
  theme: Theme;
}

function AuthPage({ mode, notice, onLogin, onSignup, onToggleTheme, theme }: AuthPageProps) {
  const navigate = useNavigate();

  function handleModeChange(nextMode: AuthMode) {
    navigate(nextMode === "signup" ? "/signup" : "/login");
  }

  return (
    <AuthScreen
      mode={mode}
      notice={notice}
      onLogin={onLogin}
      onModeChange={handleModeChange}
      onSignup={onSignup}
      onToggleTheme={onToggleTheme}
      theme={theme}
    />
  );
}

export default AuthPage;
