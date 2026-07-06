import { API_BASE_URL } from "./apiBaseUrl";

export async function wakeBackend(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });
  } catch {
    // Backend wakeup is best-effort and must not block public pages.
  }
}
