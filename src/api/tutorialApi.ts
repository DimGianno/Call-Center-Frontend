import type { TutorialState, TutorialStateUpdate } from "../types";
import { notifyAuthSessionExpired } from "../utils/authStorage";
import { API_BASE_URL } from "./apiBaseUrl";

interface TutorialApiError extends Error {
  status?: number;
}

async function tutorialRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: buildRequestHeaders(options.headers),
  });
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      notifyAuthSessionExpired();
    }

    throw createTutorialApiError(getApiErrorMessage(data), response.status);
  }

  return data as T;
}

function buildRequestHeaders(headersInit?: HeadersInit) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (headersInit) {
    new Headers(headersInit).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
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

function createTutorialApiError(message: string, status: number): TutorialApiError {
  const error = new Error(message) as TutorialApiError;
  error.status = status;
  return error;
}

function isTutorialState(value: unknown): value is TutorialState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.version === "number" &&
    Number.isInteger(candidate.version) &&
    typeof candidate.hasSeenWelcome === "boolean" &&
    (typeof candidate.completedAt === "string" || candidate.completedAt === null) &&
    (typeof candidate.skippedAt === "string" || candidate.skippedAt === null) &&
    Array.isArray(candidate.completedTopics) &&
    candidate.completedTopics.every((topic) => typeof topic === "string")
  );
}

function validateTutorialState(data: unknown): TutorialState {
  if (!isTutorialState(data)) {
    throw new Error("Invalid tutorial response.");
  }

  return data;
}

export async function fetchTutorialState(): Promise<TutorialState> {
  const data = await tutorialRequest<unknown>("/users/me/tutorial", {
    method: "GET",
  });

  return validateTutorialState(data);
}

export async function updateTutorialState(update: TutorialStateUpdate): Promise<TutorialState> {
  const data = await tutorialRequest<unknown>("/users/me/tutorial", {
    method: "PATCH",
    body: JSON.stringify(update),
  });

  return validateTutorialState(data);
}
