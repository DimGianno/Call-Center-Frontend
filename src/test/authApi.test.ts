import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API_URL = "https://api.example.test";
const sessionExpiresAt = "2026-06-07T08:40:00.000Z";
const emailVerification = {
  verified: false,
  verifiedAt: null,
  requiredAt: "2026-06-14T08:40:00.000Z",
  gracePeriodExpired: false,
};

function authUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    name: "Dimitrios",
    email: "user@example.com",
    email_verified_at: null,
    email_verification_required_at: "2026-06-14T08:40:00.000Z",
    email_verification_sent_at: null,
    ...overrides,
  };
}

function authResponse(overrides: Record<string, unknown> = {}) {
  return {
    user: authUser(),
    accessToken: "temporary-compatibility-token",
    emailVerification,
    sessionExpiresAt,
    ...overrides,
  };
}

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

  it("logs in through the backend using the HttpOnly cookie session", async () => {
    const { loginUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        authResponse({
          user: authUser({
            created_at: "2026-01-01T10:00:00.000Z",
          }),
        }),
      ),
    );

    const session = await loginUser({
      email: "user@example.com",
      password: "password123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
        }),
      }),
    );
    expect(session).toEqual({
      user: {
        id: "user-1",
        name: "Dimitrios",
        email: "user@example.com",
        email_verified_at: null,
        email_verification_required_at: "2026-06-14T08:40:00.000Z",
        email_verification_sent_at: null,
        created_at: "2026-01-01T10:00:00.000Z",
      },
      name: "Dimitrios",
      email: "user@example.com",
      emailVerification,
      sessionExpiresAt,
    });
    expect(window.localStorage.getItem("call-center-demo-session")).toBeNull();
  });

  it("signs up through the backend using the HttpOnly cookie session", async () => {
    const { signupUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        authResponse({
          user: authUser({
            id: "user-2",
            name: "Alex Agent",
            email: "alex@example.com",
          }),
        }),
      ),
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
        credentials: "include",
        body: JSON.stringify({
          name: "Alex Agent",
          email: "alex@example.com",
          password: "password123",
        }),
      }),
    );
  });

  it("restores the current session through the refresh endpoint", async () => {
    const { getCurrentSession } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        authResponse({
          accessToken: undefined,
        }),
      ),
    );

    await expect(getCurrentSession()).resolves.toEqual(
      expect.objectContaining({
        name: "Dimitrios",
        email: "user@example.com",
        sessionExpiresAt,
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/refresh`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("returns null when the refresh endpoint rejects the cookie session", async () => {
    const { getCurrentSession } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Session expired." }, 401));

    await expect(getCurrentSession()).resolves.toBeNull();
  });

  it.each([
    {
      description: "a missing session expiry",
      response: {
        user: { id: "user-1", name: "Dimitrios", email: "user@example.com" },
      },
    },
    {
      description: "an invalid session expiry",
      response: {
        user: { id: "user-1", name: "Dimitrios", email: "user@example.com" },
        sessionExpiresAt: "not-a-date",
      },
    },
    {
      description: "an invalid user",
      response: {
        user: { id: "", name: "Dimitrios", email: "not-an-email" },
        sessionExpiresAt,
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

  it("calls the backend logout endpoint and clears legacy local state", async () => {
    const { logoutUser } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    window.localStorage.setItem("call-center-demo-session", "{}");
    fetchMock.mockResolvedValueOnce(jsonResponse(null));

    await logoutUser();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/logout`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(window.localStorage.getItem("call-center-demo-session")).toBeNull();
  });

  it("calls the backend resend verification endpoint", async () => {
    const { resendVerificationEmail } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Sent" }));

    await resendVerificationEmail();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/resend-verification`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("calls the backend verify email endpoint with a token", async () => {
    const { verifyEmailToken } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Verified" }));

    await verifyEmailToken("verification-token");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/verify-email`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ token: "verification-token" }),
      }),
    );
  });

  it("requests a password reset with the account email", async () => {
    const { requestPasswordReset } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Requested" }));
    await requestPasswordReset("user@example.com");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/forgot-password`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "user@example.com" }),
      }),
    );
  });

  it("resets a password with an emailed token", async () => {
    const { resetPassword } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Reset" }));
    await resetPassword({ token: "reset-token", password: "new-password123" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/reset-password`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ token: "reset-token", password: "new-password123" }),
      }),
    );
  });

  it("changes the authenticated user's password", async () => {
    const { changePassword } = await importAuthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Changed" }));
    await changePassword({
      currentPassword: "password123",
      newPassword: "new-password123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/change-password`,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          currentPassword: "password123",
          newPassword: "new-password123",
        }),
      }),
    );
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
