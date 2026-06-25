import type { Call, CallsPageResponse, ResetCallsResult } from "../types";
import { notifyAuthSessionExpired } from "../utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

interface ApiError extends Error {
  shouldRetry?: boolean;
  status?: number;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_URL environment variable.");
  }

  const { headers, ...requestOptions } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        credentials: "include",
        headers: buildRequestHeaders(headers),
      });

      const data = await parseJsonResponse(response);

      if (response.ok) {
        return data as T;
      }

      const errorMessage = getApiErrorMessage(data);

      if (!shouldRetryResponse(response) || attempt === MAX_RETRY_ATTEMPTS) {
        if (response.status === 401) {
          notifyAuthSessionExpired();
        }

        throw createApiError(errorMessage, false, response.status);
      }

      lastError = new Error(errorMessage);
    } catch (error) {
      lastError = error;

      if (isApiError(error) && error.shouldRetry === false) {
        break;
      }

      if (attempt === MAX_RETRY_ATTEMPTS) {
        break;
      }
    }

    await waitBeforeRetry(attempt);
  }

  throw lastError instanceof Error ? lastError : new Error("Something went wrong.");
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

function shouldRetryResponse(response: Response) {
  return response.status >= 500;
}

function getApiErrorMessage(data: unknown) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as Record<string, unknown>).error;

    if (typeof error === "string") {
      return error;
    }
  }

  return "Something went wrong while contacting the API.";
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && "shouldRetry" in error;
}

function createApiError(message: string, shouldRetry: boolean, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.shouldRetry = shouldRetry;
  error.status = status;
  return error;
}

function waitBeforeRetry(attempt: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1));
  });
}

async function fetchCallsPage({
  isArchived,
  page = 1,
  limit = 50,
}: {
  isArchived: boolean;
  page?: number;
  limit?: number;
}): Promise<CallsPageResponse> {
  const searchParams = new URLSearchParams({
    is_archived: String(isArchived),
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/calls?${searchParams.toString()}`);
}

async function fetchCallsByArchiveStatus(isArchived: boolean): Promise<Call[]> {
  const firstPage = await fetchCallsPage({ isArchived });
  const totalPages = firstPage.pagination?.totalPages ?? 1;

  if (totalPages === 1) {
    return firstPage.calls;
  }

  const remainingPageRequests = [];

  for (let page = 2; page <= totalPages; page += 1) {
    remainingPageRequests.push(fetchCallsPage({ isArchived, page }));
  }

  const remainingPages = await Promise.all(remainingPageRequests);

  return [...firstPage.calls, ...remainingPages.flatMap((pageData) => pageData.calls)];
}

export async function fetchAllCalls(): Promise<Call[]> {
  const [activeCalls, archivedCalls] = await Promise.all([
    fetchCallsByArchiveStatus(false),
    fetchCallsByArchiveStatus(true),
  ]);

  return [...activeCalls, ...archivedCalls];
}

export function fetchCall(callId: string): Promise<Call> {
  return apiRequest<Call>(`/calls/${callId}`);
}

export function addCallNote(callId: string, content: string): Promise<Call> {
  return apiRequest<Call>(`/calls/${callId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function archiveCall(callId: string): Promise<Call> {
  return apiRequest<Call>(`/calls/${callId}/archive`, {
    method: "PATCH",
  });
}

export function deleteCall(callId: string): Promise<null> {
  return apiRequest<null>(`/calls/${callId}`, {
    method: "DELETE",
  });
}

export function unarchiveCall(callId: string): Promise<Call> {
  return apiRequest<Call>(`/calls/${callId}/unarchive`, {
    method: "PATCH",
  });
}

export function archiveAllCalls(): Promise<null> {
  return apiRequest<null>("/calls/archive-all", {
    method: "PATCH",
  });
}

export function unarchiveAllCalls(): Promise<null> {
  return apiRequest<null>("/calls/unarchive-all", {
    method: "PATCH",
  });
}

export function resetCalls(): Promise<ResetCallsResult | null> {
  return apiRequest<ResetCallsResult | null>("/calls/reset", {
    method: "POST",
  });
}
