import {
  clearActiveSession,
  getActiveSession,
  refreshActiveSession,
  signInDemoUser,
  signUpDemoUser,
} from "../utils/authStorage";
import type { AuthSession, LoginCredentials, SignupCredentials } from "../types";

export async function getCurrentSession(): Promise<AuthSession | null> {
  return getActiveSession();
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  return signInDemoUser(credentials);
}

export async function signupUser(credentials: SignupCredentials): Promise<AuthSession> {
  return signUpDemoUser(credentials);
}

export async function logoutUser() {
  clearActiveSession();
}

export async function refreshSession(session: AuthSession): Promise<AuthSession> {
  return refreshActiveSession(session);
}
