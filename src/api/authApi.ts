import {
  clearActiveSession,
  getActiveSession,
  refreshActiveSession,
  saveActiveSession,
} from "../utils/authStorage";
import type { AuthResponse, AuthSession, LoginCredentials, SignupCredentials } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

async function authRequest(path: string, body: LoginCredentials | SignupCredentials) {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_URL environment variable.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data));
  }

  return saveActiveSession(data as AuthResponse);
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getApiErrorMessage(data: unknown) {
  if (data && typeof data === "object") {
    const responseData = data as Record<string, unknown>;
    const error = responseData.error ?? responseData.message;

    if (typeof error === "string") {
      return error;
    }
  }

  return "Something went wrong while contacting the API.";
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  return getActiveSession();
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  return authRequest("/auth/login", credentials);
}

export async function signupUser(credentials: SignupCredentials): Promise<AuthSession> {
  return authRequest("/auth/signup", credentials);
}

export async function logoutUser() {
  clearActiveSession();
}

export async function refreshSession(session: AuthSession): Promise<AuthSession> {
  return refreshActiveSession(session);
}
