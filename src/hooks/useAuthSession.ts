import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changePassword,
  getCurrentSession,
  isEmailVerificationRequiredError,
  loginUser,
  logoutUser,
  refreshSession,
  resetPassword,
  signupUser,
} from "../api/authApi";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearActiveSession,
  SESSION_DURATION_SECONDS,
} from "../utils/authStorage";
import type {
  AuthSession,
  ChangePasswordCredentials,
  LoginCredentials,
  ResetPasswordCredentials,
  SignupCredentials,
} from "../types";

function getRemainingSessionSeconds(session: AuthSession) {
  const expiresAtMs = Date.parse(session.sessionExpiresAt);

  if (!Number.isFinite(expiresAtMs)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
}

function useAuthSession() {
  const navigate = useNavigate();
  const authMutationIdRef = useRef(0);
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
      const loadSessionMutationId = authMutationIdRef.current;
      let currentSession: AuthSession | null;

      try {
        currentSession = await getCurrentSession();
      } catch (error) {
        if (isEmailVerificationRequiredError(error)) {
          setAuthNotice("Please verify your email address to continue.");
        }

        currentSession = null;
      }

      if (!isMounted) {
        return;
      }

      if (loadSessionMutationId === authMutationIdRef.current) {
        setSession(currentSession);
        setRemainingSessionSeconds(
          currentSession ? getRemainingSessionSeconds(currentSession) : SESSION_DURATION_SECONDS,
        );
      }

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
      authMutationIdRef.current += 1;
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
      authMutationIdRef.current += 1;
      setAuthNotice("");
      setRemainingSessionSeconds(getRemainingSessionSeconds(nextSession));
      setSession(nextSession);
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  const handleLogout = useCallback(
    async (message = "") => {
      authMutationIdRef.current += 1;
      await logoutUser();
      expireFrontendSession(message);
    },
    [expireFrontendSession],
  );

  const completePasswordUpdate = useCallback(() => {
    authMutationIdRef.current += 1;
    clearActiveSession();
    setSession(null);
    setRemainingSessionSeconds(0);
    setAuthNotice("Password updated successfully. Please log in with your new password.");
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleResetPassword = useCallback(
    async (credentials: ResetPasswordCredentials) => {
      await resetPassword(credentials);
      completePasswordUpdate();
    },
    [completePasswordUpdate],
  );

  const handleChangePassword = useCallback(
    async (credentials: ChangePasswordCredentials) => {
      await changePassword(credentials);
      completePasswordUpdate();
    },
    [completePasswordUpdate],
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

    try {
      const refreshedSession = await refreshSession();
      setSession(refreshedSession);
      setRemainingSessionSeconds(getRemainingSessionSeconds(refreshedSession));
    } catch (error) {
      if (isEmailVerificationRequiredError(error)) {
        expireFrontendSession("Please verify your email address to continue.");
        return;
      }

      throw error;
    }
  }

  return {
    session,
    isAuthReady,
    authNotice,
    remainingSessionSeconds,
    handleLogin,
    handleSignup,
    handleLogout,
    handleResetPassword,
    handleChangePassword,
    handleRefreshSessionTimer,
  };
}

export default useAuthSession;
