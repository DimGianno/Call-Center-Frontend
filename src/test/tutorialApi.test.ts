import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API_URL = "https://api.example.test";

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  } as unknown as Response;
}

async function importTutorialApi({ apiUrl = API_URL }: { apiUrl?: string } = {}) {
  vi.resetModules();

  if (apiUrl) {
    vi.stubEnv("VITE_API_URL", apiUrl);
  } else {
    vi.stubEnv("VITE_API_URL", "");
  }

  return import("../api/tutorialApi");
}

describe("tutorialApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("fetches the current user's tutorial state with the cookie session", async () => {
    const { fetchTutorialState } = await importTutorialApi();
    const fetchMock = vi.mocked(fetch);
    const tutorialState = {
      version: 1,
      hasSeenWelcome: false,
      completedAt: null,
      skippedAt: null,
      completedTopics: [],
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(tutorialState));

    await expect(fetchTutorialState()).resolves.toEqual(tutorialState);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/me/tutorial`,
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    );
  });

  it("updates tutorial state with a PATCH request", async () => {
    const { updateTutorialState } = await importTutorialApi();
    const fetchMock = vi.mocked(fetch);
    const tutorialState = {
      version: 1,
      hasSeenWelcome: true,
      completedAt: "2026-07-01T10:00:00.000Z",
      skippedAt: null,
      completedTopics: ["seeding"],
    };
    const update = {
      version: 1,
      hasSeenWelcome: true,
      completedTopics: ["seeding"],
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(tutorialState));

    await expect(updateTutorialState(update)).resolves.toEqual(tutorialState);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/users/me/tutorial`,
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(update),
      }),
    );
  });

  it("surfaces backend tutorial errors", async () => {
    const { fetchTutorialState } = await importTutorialApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Tutorial unavailable." }, 500));

    await expect(fetchTutorialState()).rejects.toThrow("Tutorial unavailable.");
  });

  it("emits session expiry when the tutorial endpoint returns 401", async () => {
    const { fetchTutorialState } = await importTutorialApi();
    const fetchMock = vi.mocked(fetch);
    const sessionExpiredListener = vi.fn();

    window.addEventListener("call-center-auth-session-expired", sessionExpiredListener);
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Session expired." }, 401));

    await expect(fetchTutorialState()).rejects.toThrow("Session expired.");
    expect(sessionExpiredListener).toHaveBeenCalledTimes(1);

    window.removeEventListener("call-center-auth-session-expired", sessionExpiredListener);
  });

  it("rejects invalid tutorial responses", async () => {
    const { fetchTutorialState } = await importTutorialApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        version: 1,
        hasSeenWelcome: "no",
        completedAt: null,
        skippedAt: null,
        completedTopics: [],
      }),
    );

    await expect(fetchTutorialState()).rejects.toThrow("Invalid tutorial response.");
  });

  it("uses the same-origin API proxy when VITE_API_URL is missing", async () => {
    const { fetchTutorialState } = await importTutorialApi({ apiUrl: "" });
    const fetchMock = vi.mocked(fetch);
    const tutorialState = {
      version: 1,
      hasSeenWelcome: false,
      completedAt: null,
      skippedAt: null,
      completedTopics: [],
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(tutorialState));

    await expect(fetchTutorialState()).resolves.toEqual(tutorialState);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users/me/tutorial",
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });
});
