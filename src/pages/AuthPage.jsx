import { useNavigate } from "react-router-dom";
import AuthScreen from "../components/AuthScreen";

function AuthPage({ mode, notice, onLogin, onSignup }) {
  const navigate = useNavigate();

  function handleModeChange(nextMode) {
    navigate(nextMode === "signup" ? "/signup" : "/login");
  }

  return (
    <AuthScreen
      mode={mode}
      notice={notice}
      onLogin={onLogin}
      onModeChange={handleModeChange}
      onSignup={onSignup}
    />
  );
}

export default AuthPage;
