import { buildSession, clearActiveSession } from "../utils/authStorage";
import type { AuthResponse, AuthSession, LoginCredentials, SignupCredentials } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface AuthApiError extends Error {
  status?: number;
}

async function authRequest(path: string, body?: LoginCredentials | SignupCredentials) {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_URL environment variable.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw createAuthApiError(getApiErrorMessage(data), response.status);
  }

  return data;
}

async function authSessionRequest(
  path: string,
  body?: LoginCredentials | SignupCredentials,
): Promise<AuthSession> {
  const data = await authRequest(path, body);

  return buildSession(data as AuthResponse);
}

function createAuthApiError(message: string, status: number): AuthApiError {
  const error = new Error(message) as AuthApiError;
  error.status = status;
  return error;
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

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && "status" in error && (error as AuthApiError).status === 401;
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    return await refreshSession();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      clearActiveSession();
      return null;
    }

    throw error;
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  return authSessionRequest("/auth/login", credentials);
}

export async function signupUser(credentials: SignupCredentials): Promise<AuthSession> {
  return authSessionRequest("/auth/signup", credentials);
}

export async function logoutUser() {
  try {
    await authRequest("/auth/logout");
  } catch {
    // The frontend should still clear its state even if the server session is already gone.
  } finally {
    clearActiveSession();
  }
}

export async function refreshSession(): Promise<AuthSession> {
  return authSessionRequest("/auth/refresh");
}
