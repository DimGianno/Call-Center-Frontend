import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API_URL = "https://api.example.test";

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  } as unknown as Response;
}

function emptyResponse(status = 204): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(""),
  } as unknown as Response;
}

async function importCallsApi({ apiUrl = API_URL }: { apiUrl?: string } = {}) {
  vi.resetModules();

  if (apiUrl) {
    vi.stubEnv("VITE_API_URL", apiUrl);
  } else {
    vi.stubEnv("VITE_API_URL", "");
  }

  return import("../api/callsApi");
}

function getFetchHeaders(fetchMock: ReturnType<typeof vi.mocked<typeof fetch>>, callIndex: number) {
  return fetchMock.mock.calls[callIndex]?.[1]?.headers as Headers;
}

describe("callsApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("fetches active and archived paginated calls and combines them", async () => {
    const { fetchAllCalls } = await importCallsApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          calls: [{ id: "active-1" }],
          pagination: { totalPages: 2 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          calls: [{ id: "archived-1" }],
          pagination: { totalPages: 1 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          calls: [{ id: "active-2" }],
          pagination: { totalPages: 2 },
        }),
      );

    await expect(fetchAllCalls()).resolves.toEqual([
      { id: "active-1" },
      { id: "active-2" },
      { id: "archived-1" },
    ]);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/calls?is_archived=false&page=1&limit=50`);
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ credentials: "include" }),
    );
    expect(getFetchHeaders(fetchMock, 0).get("Authorization")).toBeNull();
    expect(getFetchHeaders(fetchMock, 0).get("Content-Type")).toBe("application/json");
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/calls?is_archived=true&page=1&limit=50`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/calls?is_archived=false&page=2&limit=50`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("retries server failures before returning successful data", async () => {
    const { fetchCall } = await importCallsApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "Temporary outage." }, 500))
      .mockResolvedValueOnce(jsonResponse({ id: "call-1" }));

    const callPromise = fetchCall("call-1");
    await vi.advanceTimersByTimeAsync(400);

    await expect(callPromise).resolves.toEqual({ id: "call-1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries network failures before returning successful data", async () => {
    const { fetchCall } = await importCallsApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockRejectedValueOnce(new Error("Network down."))
      .mockResolvedValueOnce(jsonResponse({ id: "call-1" }));

    const callPromise = fetchCall("call-1");
    await vi.advanceTimersByTimeAsync(400);

    await expect(callPromise).resolves.toEqual({ id: "call-1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry client errors and surfaces the API message", async () => {
    const { addCallNote } = await importCallsApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Invalid note." }, 400));

    await expect(addCallNote("call-1", "Hello")).rejects.toThrow("Invalid note.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("notifies the app when a protected request returns 401", async () => {
    const { fetchCall } = await importCallsApi();
    const fetchMock = vi.mocked(fetch);
    const sessionExpiredListener = vi.fn();

    window.addEventListener("call-center-auth-session-expired", sessionExpiredListener);
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Session expired." }, 401));

    await expect(fetchCall("call-1")).rejects.toThrow("Session expired.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sessionExpiredListener).toHaveBeenCalledTimes(1);
    window.removeEventListener("call-center-auth-session-expired", sessionExpiredListener);
  });

  it("sends request methods and JSON bodies for mutations", async () => {
    const { addCallNote, archiveCall, deleteCall, resetCalls } = await importCallsApi();
    const fetchMock = vi.mocked(fetch);

    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: "call-1", notes: [{ content: "Hello" }] }))
      .mockResolvedValueOnce(jsonResponse({ id: "call-1", is_archived: true }))
      .mockResolvedValueOnce(emptyResponse())
      .mockResolvedValueOnce(
        jsonResponse({
          message: "Calls reset successfully",
          deletedCount: 4,
          insertedCount: 150,
        }),
      );

    await addCallNote("call-1", "Hello");
    await archiveCall("call-1");
    await deleteCall("call-1");
    await resetCalls();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${API_URL}/calls/call-1/notes`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "Hello" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${API_URL}/calls/call-1/archive`,
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${API_URL}/calls/call-1`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${API_URL}/calls/reset`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("uses the same-origin API proxy when VITE_API_URL is missing", async () => {
    const { fetchCall } = await importCallsApi({ apiUrl: "" });
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "call-1" }));

    await expect(fetchCall("call-1")).resolves.toEqual({ id: "call-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/calls/call-1",
      expect.objectContaining({
        credentials: "include",
      }),
    );
  });
});
