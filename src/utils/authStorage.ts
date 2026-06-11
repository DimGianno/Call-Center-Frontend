import type { AuthSession, DemoUser, LoginCredentials, SignupCredentials } from "../types";

const DEMO_USERS_STORAGE_KEY = "call-center-demo-users";
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

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isDemoUser(value: unknown): value is DemoUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string"
  );
}

function isSessionCandidate(value: unknown): value is Pick<AuthSession, "name" | "email"> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;

  return typeof session.name === "string" && typeof session.email === "string";
}

function buildSession(user: Pick<AuthSession, "name" | "email">): AuthSession {
  return {
    name: user.name,
    email: user.email,
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

export function getDemoUsers(): DemoUser[] {
  const users = readJson<unknown>(DEMO_USERS_STORAGE_KEY, []);

  if (!Array.isArray(users)) {
    return [];
  }

  return users.filter(isDemoUser);
}

export function signUpDemoUser({ name, email, password }: SignupCredentials): AuthSession {
  const normalizedEmail = normalizeEmail(email);
  const users = getDemoUsers();
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user: DemoUser = {
    name: name.trim(),
    email: normalizedEmail,
    password,
  };
  const session = buildSession(user);

  writeJson(DEMO_USERS_STORAGE_KEY, [...users, user]);
  writeJson(ACTIVE_SESSION_STORAGE_KEY, session);

  return session;
}

export function signInDemoUser({ email, password }: LoginCredentials): AuthSession {
  const normalizedEmail = normalizeEmail(email);
  const user = getDemoUsers().find((storedUser) => {
    return storedUser.email === normalizedEmail && storedUser.password === password;
  });

  if (!user) {
    throw new Error("Email or password is incorrect.");
  }

  const session = buildSession(user);
  writeJson(ACTIVE_SESSION_STORAGE_KEY, session);

  return session;
}

export function getActiveSession(): AuthSession | null {
  const session = readJson<unknown>(ACTIVE_SESSION_STORAGE_KEY, null);

  if (!isSessionCandidate(session)) {
    return null;
  }

  return buildSession(session);
}

export function refreshActiveSession(session: AuthSession): AuthSession {
  const refreshedSession = buildSession(session);
  writeJson(ACTIVE_SESSION_STORAGE_KEY, refreshedSession);
  return refreshedSession;
}

export function clearActiveSession() {
  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}
