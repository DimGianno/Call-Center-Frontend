import type { AuthResponse, AuthSession } from "../types";

const ACTIVE_SESSION_STORAGE_KEY = "call-center-demo-session";
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LABEL_LENGTH = 63;
const MIN_PASSWORD_LENGTH = 8;
const LOCAL_PART_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

export const SESSION_DURATION_SECONDS = 10 * 60;
export const AUTH_SESSION_EXPIRED_EVENT = "call-center-auth-session-expired";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableIsoDate(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && Number.isFinite(Date.parse(value)));
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
    isNullableIsoDate(value.email_verified_at) &&
    isNullableIsoDate(value.email_verification_required_at) &&
    isNullableIsoDate(value.email_verification_sent_at) &&
    (value.created_at === undefined || typeof value.created_at === "string")
  );
}

function isEmailVerificationStatus(value: unknown): value is AuthResponse["emailVerification"] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.verified === "boolean" &&
    isNullableIsoDate(value.verifiedAt) &&
    isNullableIsoDate(value.requiredAt) &&
    typeof value.gracePeriodExpired === "boolean"
  );
}

function isAuthResponse(value: unknown): value is AuthResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isAuthUser(value.user) &&
    isEmailVerificationStatus(value.emailVerification) &&
    isValidSessionExpiresAt(value.sessionExpiresAt)
  );
}

function isValidSessionExpiresAt(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

export function buildSession(authResponse: AuthResponse): AuthSession {
  if (!isAuthResponse(authResponse)) {
    throw new Error("Invalid authentication response.");
  }

  return {
    user: authResponse.user,
    name: authResponse.user.name,
    email: authResponse.user.email,
    emailVerification: authResponse.emailVerification,
    sessionExpiresAt: authResponse.sessionExpiresAt,
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

export function getPasswordValidationMessage(password: string): string {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return "";
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

  const passwordValidationMessage = getPasswordValidationMessage(password);

  if (passwordValidationMessage) {
    return passwordValidationMessage;
  }

  return "";
}

export function clearActiveSession() {
  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}

export function notifyAuthSessionExpired() {
  clearActiveSession();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}
