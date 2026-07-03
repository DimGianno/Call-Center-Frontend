const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function wakeBackend(): Promise<void> {
  if (!API_BASE_URL) {
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });
  } catch {
    // Backend wakeup is best-effort and must not block public pages.
  }
}
