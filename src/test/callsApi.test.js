import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API_URL = "https://api.example.test";

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

function emptyResponse(status = 204) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(""),
  };
}

async function importCallsApi({ apiUrl = API_URL } = {}) {
  vi.resetModules();

  if (apiUrl) {
    vi.stubEnv("VITE_API_URL", apiUrl);
  } else {
    vi.stubEnv("VITE_API_URL", "");
  }

  return import("../api/callsApi");
}

describe("callsApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("fetches active and archived paginated calls and combines them", async () => {
    const { fetchAllCalls } = await importCallsApi();

    fetch
      .mockResolvedValueOnce(jsonResponse({
        calls: [{ id: "active-1" }],
        pagination: { totalPages: 2 },
      }))
      .mockResolvedValueOnce(jsonResponse({
        calls: [{ id: "archived-1" }],
        pagination: { totalPages: 1 },
      }))
      .mockResolvedValueOnce(jsonResponse({
        calls: [{ id: "active-2" }],
        pagination: { totalPages: 2 },
      }));

    await expect(fetchAllCalls()).resolves.toEqual([
      { id: "active-1" },
      { id: "active-2" },
      { id: "archived-1" },
    ]);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/calls?is_archived=false&page=1&limit=50`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/calls?is_archived=true&page=1&limit=50`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/calls?is_archived=false&page=2&limit=50`,
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("retries server failures before returning successful data", async () => {
    const { fetchCall } = await importCallsApi();

    fetch
      .mockResolvedValueOnce(jsonResponse({ error: "Temporary outage." }, 500))
      .mockResolvedValueOnce(jsonResponse({ id: "call-1" }));

    const callPromise = fetchCall("call-1");
    await vi.advanceTimersByTimeAsync(400);

    await expect(callPromise).resolves.toEqual({ id: "call-1" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("retries network failures before returning successful data", async () => {
    const { fetchCall } = await importCallsApi();

    fetch
      .mockRejectedValueOnce(new Error("Network down."))
      .mockResolvedValueOnce(jsonResponse({ id: "call-1" }));

    const callPromise = fetchCall("call-1");
    await vi.advanceTimersByTimeAsync(400);

    await expect(callPromise).resolves.toEqual({ id: "call-1" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry client errors and surfaces the API message", async () => {
    const { addCallNote } = await importCallsApi();

    fetch.mockResolvedValueOnce(jsonResponse({ error: "Invalid note." }, 400));

    await expect(addCallNote("call-1", "Hello")).rejects.toThrow("Invalid note.");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("sends request methods and JSON bodies for mutations", async () => {
    const { addCallNote, archiveCall, deleteCall } = await importCallsApi();

    fetch
      .mockResolvedValueOnce(jsonResponse({ id: "call-1", notes: [{ content: "Hello" }] }))
      .mockResolvedValueOnce(jsonResponse({ id: "call-1", is_archived: true }))
      .mockResolvedValueOnce(emptyResponse());

    await addCallNote("call-1", "Hello");
    await archiveCall("call-1");
    await deleteCall("call-1");

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      `${API_URL}/calls/call-1/notes`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "Hello" }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `${API_URL}/calls/call-1/archive`,
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      `${API_URL}/calls/call-1`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("throws a helpful error when the API URL is missing", async () => {
    const { fetchCall } = await importCallsApi({ apiUrl: "" });

    await expect(fetchCall("call-1")).rejects.toThrow(
      "Missing VITE_API_URL environment variable.",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
