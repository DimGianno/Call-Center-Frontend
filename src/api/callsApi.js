const API_BASE_URL = import.meta.env.VITE_API_URL;
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_URL environment variable.");
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await parseJsonResponse(response);

      if (response.ok) {
        return data;
      }

      const errorMessage = data?.error ?? "Something went wrong while contacting the API.";

      if (!shouldRetryResponse(response) || attempt === MAX_RETRY_ATTEMPTS) {
        throw createApiError(errorMessage, false);
      }

      lastError = new Error(errorMessage);
    } catch (error) {
      lastError = error;

      if (error.shouldRetry === false || attempt === MAX_RETRY_ATTEMPTS) {
        break;
      }
    }

    await waitBeforeRetry(attempt);
  }

  throw lastError;
}

async function parseJsonResponse(response) {
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

function shouldRetryResponse(response) {
  return response.status >= 500;
}

function createApiError(message, shouldRetry) {
  const error = new Error(message);
  error.shouldRetry = shouldRetry;
  return error;
}

function waitBeforeRetry(attempt) {
  return new Promise((resolve) => {
    setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1));
  });
}

async function fetchCallsPage({ isArchived, page = 1, limit = 50 }) {
  const searchParams = new URLSearchParams({
    is_archived: String(isArchived),
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/calls?${searchParams.toString()}`);
}

async function fetchCallsByArchiveStatus(isArchived) {
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

export async function fetchAllCalls() {
  const [activeCalls, archivedCalls] = await Promise.all([
    fetchCallsByArchiveStatus(false),
    fetchCallsByArchiveStatus(true),
  ]);

  return [...activeCalls, ...archivedCalls];
}

export function fetchCall(callId) {
  return apiRequest(`/calls/${callId}`);
}

export function addCallNote(callId, content) {
  return apiRequest(`/calls/${callId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function archiveCall(callId) {
  return apiRequest(`/calls/${callId}/archive`, {
    method: "PATCH",
  });
}

export function deleteCall(callId) {
  return apiRequest(`/calls/${callId}`, {
    method: "DELETE",
  });
}

export function unarchiveCall(callId) {
  return apiRequest(`/calls/${callId}/unarchive`, {
    method: "PATCH",
  });
}

export function archiveAllCalls() {
  return apiRequest("/calls/archive-all", {
    method: "PATCH",
  });
}

export function unarchiveAllCalls() {
  return apiRequest("/calls/unarchive-all", {
    method: "PATCH",
  });
}
