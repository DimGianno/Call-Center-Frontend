import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API_URL = "https://api.example.test";

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  } as unknown as Response;
}

async function importAuthApi({ apiUrl = API_URL }: { apiUrl?: string } = {}) {
  vi.resetModules();

  if (apiUrl) {
    vi.stubEnv("VITE_API_URL", apiUrl);
  } else {
    vi.stubEnv("VITE_API_URL", "");
  }

  return import("../api/authApi");
}

describe("authApi", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("logs in through the backend and stores the active session", async () => {
    const { getCurrentSession, loginUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        user: {
          id: "user-1",
          name: "Dimitrios",
          email: "user@example.com",
          created_at: "2026-01-01T10:00:00.000Z",
        },
        accessToken: "jwt-token",
      }),
    );

    const session = await loginUser({
      email: "user@example.com",
      password: "password123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
        }),
      }),
    );
    expect(session).toEqual(
      expect.objectContaining({
        accessToken: "jwt-token",
        name: "Dimitrios",
        email: "user@example.com",
      }),
    );
    await expect(getCurrentSession()).resolves.toEqual(
      expect.objectContaining({
        accessToken: "jwt-token",
        name: "Dimitrios",
      }),
    );
  });

  it("signs up through the backend and stores the active session", async () => {
    const { signupUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        user: {
          id: "user-2",
          name: "Alex Agent",
          email: "alex@example.com",
        },
        accessToken: "signup-token",
      }),
    );

    await signupUser({
      name: "Alex Agent",
      email: "alex@example.com",
      password: "password123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/signup`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Alex Agent",
          email: "alex@example.com",
          password: "password123",
        }),
      }),
    );
  });

  it.each([
    {
      description: "a blank access token",
      response: {
        user: { id: "user-1", name: "Dimitrios", email: "user@example.com" },
        accessToken: "   ",
      },
    },
    {
      description: "an invalid user",
      response: {
        user: { id: "", name: "Dimitrios", email: "not-an-email" },
        accessToken: "jwt-token",
      },
    },
  ])("rejects an authentication response containing $description", async ({ response }) => {
    const { loginUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse(response));

    await expect(
      loginUser({
        email: "user@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Invalid authentication response.");
    expect(window.localStorage.getItem("call-center-demo-session")).toBeNull();
  });

  it("rejects invalid or inconsistent stored sessions", async () => {
    const { getCurrentSession } = await importAuthApi();
    const validSession = {
      user: { id: "user-1", name: "Dimitrios", email: "user@example.com" },
      accessToken: "jwt-token",
      name: "Dimitrios",
      email: "user@example.com",
      startedAt: Date.now(),
    };

    for (const invalidFields of [
      { startedAt: "not-a-timestamp" },
      { name: "Different Name" },
      { email: "different@example.com" },
    ]) {
      window.localStorage.setItem(
        "call-center-demo-session",
        JSON.stringify({ ...validSession, ...invalidFields }),
      );

      await expect(getCurrentSession()).resolves.toBeNull();
    }
  });

  it("surfaces backend auth errors", async () => {
    const { loginUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Invalid email or password" }, 401));

    await expect(
      loginUser({
        email: "missing@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Invalid email or password");
  });
});
