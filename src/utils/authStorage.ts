import type { AuthResponse, AuthSession } from "../types";

const ACTIVE_SESSION_STORAGE_KEY = "call-center-demo-session";

export const SESSION_DURATION_SECONDS = 10 * 60;

function readJson<T>(key: string, fallbackValue: T): T {
  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue) as T;
  } catch {
    return fallbackValue;
  }
}

function writeJson(key: string, value: unknown): void {
  let serializedValue: string;

  try {
    const result = JSON.stringify(value);

    if (result === undefined) {
      throw new Error("The supplied value cannot be serialized.");
    }

    serializedValue = result;
  } catch (error) {
    throw new Error("Unable to serialize session data.", {
      cause: error,
    });
  }

  try {
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    throw new Error("Unable to save your session. Check your browser storage settings.", {
      cause: error,
    });
  }
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;
  const user = response.user;

  return (
    typeof response.accessToken === "string" &&
    !!user &&
    typeof user === "object" &&
    typeof (user as Record<string, unknown>).id === "string" &&
    typeof (user as Record<string, unknown>).name === "string" &&
    typeof (user as Record<string, unknown>).email === "string"
  );
}

function isSessionCandidate(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;
  const user = session.user;

  return (
    typeof session.name === "string" &&
    typeof session.email === "string" &&
    typeof session.accessToken === "string" &&
    !!user &&
    typeof user === "object" &&
    typeof (user as Record<string, unknown>).id === "string" &&
    typeof (user as Record<string, unknown>).name === "string" &&
    typeof (user as Record<string, unknown>).email === "string"
  );
}

export function buildSession(authResponse: AuthResponse): AuthSession {
  return {
    user: authResponse.user,
    accessToken: authResponse.accessToken,
    name: authResponse.user.name,
    email: authResponse.user.email,
    startedAt: Date.now(),
  };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateAuthForm({
  name = "",
  email,
  password,
  isSignup,
}: {
  name?: string;
  email: string;
  password: string;
  isSignup: boolean;
}) {
  if (isSignup && name.trim() === "") {
    return "Name is required.";
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return "";
}

export function saveActiveSession(authResponse: AuthResponse): AuthSession {
  if (!isAuthResponse(authResponse)) {
    throw new Error("Invalid authentication response.");
  }

  const session = buildSession(authResponse);
  writeJson(ACTIVE_SESSION_STORAGE_KEY, session);

  return session;
}

export function getActiveSession(): AuthSession | null {
  const session = readJson<unknown>(ACTIVE_SESSION_STORAGE_KEY, null);

  if (!isSessionCandidate(session)) {
    return null;
  }

  return session;
}

export function refreshActiveSession(session: AuthSession): AuthSession {
  const refreshedSession = {
    ...session,
    startedAt: Date.now(),
  };
  writeJson(ACTIVE_SESSION_STORAGE_KEY, refreshedSession);
  return refreshedSession;
}

export function clearActiveSession() {
  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}
