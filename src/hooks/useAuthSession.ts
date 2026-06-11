import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentSession,
  loginUser,
  logoutUser,
  refreshSession,
  signupUser,
} from "../api/authApi";
import { SESSION_DURATION_SECONDS } from "../utils/authStorage";
import type { AuthSession, LoginCredentials, SignupCredentials } from "../types";

function useAuthSession() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [remainingSessionSeconds, setRemainingSessionSeconds] = useState(SESSION_DURATION_SECONDS);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const currentSession = await getCurrentSession();

      if (!isMounted) {
        return;
      }

      setSession(currentSession);
      setRemainingSessionSeconds(SESSION_DURATION_SECONDS);
      setIsAuthReady(true);
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    setRemainingSessionSeconds(SESSION_DURATION_SECONDS);

    const intervalId = setInterval(() => {
      setRemainingSessionSeconds((currentSeconds) => currentSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [session]);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      const nextSession = await loginUser(credentials);
      setAuthNotice("");
      setRemainingSessionSeconds(SESSION_DURATION_SECONDS);
      setSession(nextSession);
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  const handleSignup = useCallback(
    async (credentials: SignupCredentials) => {
      const nextSession = await signupUser(credentials);
      setAuthNotice("");
      setRemainingSessionSeconds(SESSION_DURATION_SECONDS);
      setSession(nextSession);
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  const handleLogout = useCallback(
    async (message = "") => {
      await logoutUser();
      setSession(null);
      setRemainingSessionSeconds(SESSION_DURATION_SECONDS);
      setAuthNotice(message);
      navigate("/login", { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    if (!session || remainingSessionSeconds > 0) {
      return;
    }

    handleLogout("Your session expired. Please log in again.");
  }, [handleLogout, remainingSessionSeconds, session]);

  async function handleRefreshSessionTimer() {
    if (!session) {
      return;
    }

    const refreshedSession = await refreshSession(session);
    setSession(refreshedSession);
    setRemainingSessionSeconds(SESSION_DURATION_SECONDS);
  }

  return {
    session,
    isAuthReady,
    authNotice,
    remainingSessionSeconds,
    handleLogin,
    handleSignup,
    handleLogout,
    handleRefreshSessionTimer,
  };
}

export default useAuthSession;
