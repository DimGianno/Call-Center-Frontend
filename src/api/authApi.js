import {
  clearActiveSession,
  getActiveSession,
  refreshActiveSession,
  signInDemoUser,
  signUpDemoUser,
} from "../utils/authStorage";

export async function getCurrentSession() {
  return getActiveSession();
}

export async function loginUser(credentials) {
  return signInDemoUser(credentials);
}

export async function signupUser(credentials) {
  return signUpDemoUser(credentials);
}

export async function logoutUser() {
  clearActiveSession();
}

export async function refreshSession(session) {
  return refreshActiveSession(session);
}
