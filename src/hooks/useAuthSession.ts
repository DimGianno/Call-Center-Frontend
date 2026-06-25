import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentSession,
  loginUser,
  logoutUser,
  refreshSession,
  signupUser,
} from "../api/authApi";
import { AUTH_SESSION_EXPIRED_EVENT, SESSION_DURATION_SECONDS } from "../utils/authStorage";
import type { AuthSession, LoginCredentials, SignupCredentials } from "../types";

function getRemainingSessionSeconds(session: AuthSession) {
  const expiresAtMs = Date.parse(session.sessionExpiresAt);

  if (!Number.isFinite(expiresAtMs)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
}

function useAuthSession() {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authNotice, setAuthNotice] = useState("");
  const [remainingSessionSeconds, setRemainingSessionSeconds] = useState(SESSION_DURATION_SECONDS);

  const expireFrontendSession = useCallback(
    (message = "Your session expired. Please log in again.") => {
      setSession(null);
      setRemainingSessionSeconds(0);
      setAuthNotice(message);
      navigate("/login", { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      let currentSession: AuthSession | null;

      try {
        currentSession = await getCurrentSession();
      } catch {
        currentSession = null;
      }

      if (!isMounted) {
        return;
      }

      setSession(currentSession);
      setRemainingSessionSeconds(
        currentSession ? getRemainingSessionSeconds(currentSession) : SESSION_DURATION_SECONDS,
      );
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

    const activeSession = session;

    function syncRemainingSessionSeconds() {
      setRemainingSessionSeconds(getRemainingSessionSeconds(activeSession));
    }

    syncRemainingSessionSeconds();

    const intervalId = window.setInterval(syncRemainingSessionSeconds, 1000);
    window.addEventListener("focus", syncRemainingSessionSeconds);
    document.addEventListener("visibilitychange", syncRemainingSessionSeconds);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncRemainingSessionSeconds);
      document.removeEventListener("visibilitychange", syncRemainingSessionSeconds);
    };
  }, [session]);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      const nextSession = await loginUser(credentials);
      setAuthNotice("");
      setRemainingSessionSeconds(getRemainingSessionSeconds(nextSession));
      setSession(nextSession);
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  const handleSignup = useCallback(
    async (credentials: SignupCredentials) => {
      const nextSession = await signupUser(credentials);
      setAuthNotice("");
      setRemainingSessionSeconds(getRemainingSessionSeconds(nextSession));
      setSession(nextSession);
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  const handleLogout = useCallback(
    async (message = "") => {
      await logoutUser();
      expireFrontendSession(message);
    },
    [expireFrontendSession],
  );

  useEffect(() => {
    function handleServerExpiredSession() {
      expireFrontendSession();
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleServerExpiredSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleServerExpiredSession);
    };
  }, [expireFrontendSession]);

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

    const refreshedSession = await refreshSession();
    setSession(refreshedSession);
    setRemainingSessionSeconds(getRemainingSessionSeconds(refreshedSession));
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
