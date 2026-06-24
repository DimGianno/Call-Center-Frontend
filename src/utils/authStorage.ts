import type { AuthResponse, AuthSession } from "../types";

const ACTIVE_SESSION_STORAGE_KEY = "call-center-demo-session";
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LABEL_LENGTH = 63;
const LOCAL_PART_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAuthUser(value: unknown): value is AuthResponse["user"] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.email === "string" &&
    isValidEmail(value.email) &&
    (value.created_at === undefined || typeof value.created_at === "string")
  );
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!isRecord(value)) {
    return false;
  }

  return isNonEmptyString(value.accessToken) && isAuthUser(value.user);
}

function isSessionCandidate(value: unknown): value is AuthSession {
  if (!isRecord(value) || !isAuthUser(value.user)) {
    return false;
  }

  const user = value.user;

  return (
    isNonEmptyString(value.accessToken) &&
    value.name === user.name &&
    value.email === user.email &&
    typeof value.startedAt === "number" &&
    Number.isFinite(value.startedAt) &&
    value.startedAt > 0
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

export function getEmailValidationMessage(value: string): string {
  const email = value.trim();

  if (email.length === 0) {
    return "Email is required.";
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return `Email must be ${MAX_EMAIL_LENGTH} characters or fewer.`;
  }

  const atIndex = email.lastIndexOf("@");

  if (atIndex <= 0 || atIndex !== email.indexOf("@") || atIndex === email.length - 1) {
    return "Use one @ and a complete address, such as name@example.com.";
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (localPart.length > MAX_LOCAL_PART_LENGTH) {
    return `The part before @ must be ${MAX_LOCAL_PART_LENGTH} characters or fewer.`;
  }

  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return "The part before @ cannot start or end with a dot or contain consecutive dots.";
  }

  if (!LOCAL_PART_PATTERN.test(localPart)) {
    return "Before @, use letters, numbers, and valid email symbols such as . _ + or -.";
  }

  const domainLabels = domain.split(".");

  if (domainLabels.length < 2) {
    return "Add a complete domain after @, such as example.com.";
  }

  if (domainLabels.some((label) => label.length === 0)) {
    return "The domain cannot start or end with a dot or contain consecutive dots.";
  }

  if (domainLabels.some((label) => label.length > MAX_DOMAIN_LABEL_LENGTH)) {
    return `Each domain part must be ${MAX_DOMAIN_LABEL_LENGTH} characters or fewer.`;
  }

  if (domainLabels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))) {
    return "Domain parts may use letters, numbers, or hyphens and cannot start or end with a hyphen.";
  }

  return "";
}

export function isValidEmail(email: string) {
  return getEmailValidationMessage(email) === "";
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

  const emailValidationMessage = getEmailValidationMessage(email);

  if (emailValidationMessage) {
    return emailValidationMessage;
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
