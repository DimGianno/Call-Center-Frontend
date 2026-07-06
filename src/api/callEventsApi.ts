import { API_BASE_URL } from "./apiBaseUrl";

export type CallChangeAction =
  | "archive"
  | "unarchive"
  | "delete"
  | "add_note"
  | "archive_all"
  | "unarchive_all"
  | "reset";

export interface CallChangeEvent {
  version: 1;
  action: CallChangeAction;
  callId?: string;
}

export function subscribeToCallChanges(onChange: (event: CallChangeEvent) => void) {
  const eventSource = new EventSource(`${API_BASE_URL}/events/calls`, {
    withCredentials: true,
  });

  eventSource.addEventListener("calls:changed", (event) => {
    try {
      onChange(JSON.parse((event as MessageEvent<string>).data) as CallChangeEvent);
    } catch {
      // Ignore malformed realtime events; the next valid event will refresh the dashboard.
    }
  });

  return () => {
    eventSource.close();
  };
}
