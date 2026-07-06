import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API_URL = "https://api.example.test";

async function importHealthApi({ apiUrl = API_URL }: { apiUrl?: string } = {}) {
  vi.resetModules();

  if (apiUrl) {
    vi.stubEnv("VITE_API_URL", apiUrl);
  } else {
    vi.stubEnv("VITE_API_URL", "");
  }

  return import("../api/healthApi");
}

describe("healthApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("calls the backend health endpoint", async () => {
    const { wakeBackend } = await importHealthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({ ok: true } as Response);

    await wakeBackend();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/health`,
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("does not throw when the health endpoint rejects", async () => {
    const { wakeBackend } = await importHealthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockRejectedValueOnce(new Error("Backend is still waking up."));

    await expect(wakeBackend()).resolves.toBeUndefined();
  });

  it("does not throw when the health endpoint returns a non-ok response", async () => {
    const { wakeBackend } = await importHealthApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 } as Response);

    await expect(wakeBackend()).resolves.toBeUndefined();
  });

  it("uses the same-origin API proxy when VITE_API_URL is missing", async () => {
    const { wakeBackend } = await importHealthApi({ apiUrl: "" });
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce({ ok: true } as Response);

    await expect(wakeBackend()).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });
});
