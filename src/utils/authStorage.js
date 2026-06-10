const DEMO_USERS_STORAGE_KEY = "call-center-demo-users";
const ACTIVE_SESSION_STORAGE_KEY = "call-center-demo-session";

export const SESSION_DURATION_SECONDS = 10 * 60;

function readJson(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function buildSession(user) {
  return {
    name: user.name,
    email: user.email,
    startedAt: Date.now(),
  };
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateAuthForm({ name = "", email, password, isSignup }) {
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

export function getDemoUsers() {
  const users = readJson(DEMO_USERS_STORAGE_KEY, []);

  if (!Array.isArray(users)) {
    return [];
  }

  return users;
}

export function signUpDemoUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const users = getDemoUsers();
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    name: name.trim(),
    email: normalizedEmail,
    password,
  };
  const session = buildSession(user);

  writeJson(DEMO_USERS_STORAGE_KEY, [...users, user]);
  writeJson(ACTIVE_SESSION_STORAGE_KEY, session);

  return session;
}

export function signInDemoUser({ email, password }) {
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

export function getActiveSession() {
  const session = readJson(ACTIVE_SESSION_STORAGE_KEY, null);

  if (!session || !session.name || !session.email) {
    return null;
  }

  return buildSession(session);
}

export function refreshActiveSession(session) {
  const refreshedSession = buildSession(session);
  writeJson(ACTIVE_SESSION_STORAGE_KEY, refreshedSession);
  return refreshedSession;
}

export function clearActiveSession() {
  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}
