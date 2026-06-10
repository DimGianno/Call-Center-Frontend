import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { clearActiveSession, signUpDemoUser } from "../utils/authStorage";
import {
  addCallNote,
  archiveAllCalls,
  archiveCall,
  deleteCall,
  fetchAllCalls,
  fetchCall,
  resetCalls,
  unarchiveAllCalls,
  unarchiveCall,
} from "../api/callsApi";

vi.mock("../api/callsApi", () => {
  return {
    addCallNote: vi.fn(),
    archiveAllCalls: vi.fn(),
    archiveCall: vi.fn(),
    deleteCall: vi.fn(),
    fetchAllCalls: vi.fn(),
    fetchCall: vi.fn(),
    resetCalls: vi.fn(),
    unarchiveAllCalls: vi.fn(),
    unarchiveCall: vi.fn(),
  };
});

const activeCall = {
  id: "call-1",
  direction: "inbound",
  from: "+1 555-0100",
  to: "+1 555-0110",
  call_type: "answered",
  duration: 120,
  created_at: "2026-06-07T08:30:00.000Z",
  is_archived: false,
  notes: [],
};

const archivedCall = {
  id: "call-2",
  direction: "outbound",
  from: "+1 555-0200",
  to: "+1 555-0220",
  call_type: "missed",
  duration: 45,
  created_at: "2026-06-06T10:15:00.000Z",
  is_archived: true,
  notes: [],
};

function createCall(overrides) {
  return {
    id: "call",
    direction: "inbound",
    from: "+1 555-0000",
    to: "+1 555-9999",
    call_type: "answered",
    duration: 60,
    created_at: "2026-06-07T08:30:00.000Z",
    is_archived: false,
    notes: [],
    ...overrides,
  };
}

function createCalls(count) {
  return Array.from({ length: count }, (_, index) => {
    const callNumber = String(index + 1).padStart(2, "0");

    return createCall({
      id: `call-${callNumber}`,
      from: `+1 555-10${callNumber}`,
      to: `+1 555-20${callNumber}`,
      duration: 30 + index,
      created_at: `2026-06-07T${String(23 - index).padStart(2, "0")}:30:00.000Z`,
    });
  });
}

function seedAuthenticatedSession(overrides = {}) {
  window.localStorage.setItem(
    "call-center-demo-session",
    JSON.stringify({
      name: "Test Agent",
      email: "agent@example.com",
      startedAt: Date.now(),
      ...overrides,
    }),
  );
}

function renderApp(route = "/dashboard") {
  window.history.pushState({}, "Test page", route);
  return render(<App />);
}

afterEach(() => {
  window.localStorage.clear();
  vi.useRealTimers();
});

describe("App auth gate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    fetchAllCalls.mockResolvedValue([activeCall, archivedCall]);
  });

  it("renders the home page at the root route", async () => {
    renderApp("/");

    expect(screen.getByRole("heading", { name: "Call Center Dashboard" })).toBeInTheDocument();
    expect(screen.getByText(/Track active and archived calls/i)).toBeInTheDocument();
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it("navigates from the home page to login and signup routes", async () => {
    renderApp("/");

    await userEvent.click(screen.getAllByRole("link", { name: "Login" })[0]);

    expect(window.location.pathname).toBe("/login");
    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Sign up" }));

    expect(window.location.pathname).toBe("/signup");
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("redirects unauthenticated dashboard visits to login without fetching calls", async () => {
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it("shows the auth screen and does not fetch calls before login", async () => {
    renderApp("/login");

    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Login" })).toHaveAttribute("aria-selected", "true");
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it("signs up a demo user, enters the dashboard, and starts the timer", async () => {
    renderApp("/signup");

    await userEvent.type(await screen.findByLabelText("Name"), "Alex Agent");
    await userEvent.type(screen.getByLabelText("Email"), "alex@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
    expect(fetchAllCalls).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Signed in as Alex Agent")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Session time remaining" })).toHaveTextContent(
      "10:00",
    );
  });

  it("logs in with a stored demo user", async () => {
    signUpDemoUser({
      name: "Stored Agent",
      email: "stored@example.com",
      password: "password123",
    });
    clearActiveSession();

    renderApp("/login");

    await userEvent.type(await screen.findByLabelText("Email"), "stored@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
    expect(screen.getByText("Signed in as Stored Agent")).toBeInTheDocument();
  });

  it("redirects logged-in users away from public auth routes", async () => {
    seedAuthenticatedSession();

    renderApp("/login");

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("shows validation and login errors without entering the dashboard", async () => {
    renderApp("/login");

    await userEvent.type(await screen.findByLabelText("Email"), "missing@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(fetchAllCalls).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("tab", { name: "Sign up" }));
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(window.location.pathname).toBe("/signup");
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required.");
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it("refreshes the countdown timer back to ten minutes", async () => {
    vi.useFakeTimers();
    seedAuthenticatedSession();

    renderApp("/dashboard");

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(screen.getByRole("timer", { name: "Session time remaining" })).toHaveTextContent(
      "09:55",
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Refresh session timer" }));
      await Promise.resolve();
    });

    expect(screen.getByRole("timer", { name: "Session time remaining" })).toHaveTextContent(
      "10:00",
    );
  });

  it("logs out automatically when the countdown expires", async () => {
    vi.useFakeTimers();
    seedAuthenticatedSession();

    renderApp("/dashboard");

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600000);
    });

    expect(screen.getByText("Your session expired. Please log in again.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });
});

describe("App API-backed user flows", () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedAuthenticatedSession();
    vi.clearAllMocks();
    fetchAllCalls.mockResolvedValue([activeCall, archivedCall]);
  });

  it("loads calls from the API and renders the active call feed", async () => {
    const { container } = renderApp();

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();

    expect(fetchAllCalls).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("+1 555-0200")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View archived calls" })).toBeInTheDocument();
  });

  it("shows an API error when calls fail to load", async () => {
    fetchAllCalls.mockRejectedValue(new Error("Unable to load calls."));

    const { container } = renderApp();

    expect(await screen.findByText("Unable to load calls.")).toBeInTheDocument();
    expect(screen.getByText("No calls available.")).toBeInTheDocument();
  });

  it("shows an API error when selected call details fail to load", async () => {
    fetchCall.mockRejectedValue(new Error("Unable to load call details."));

    renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));

    expect(fetchCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("Unable to load call details.")).toBeInTheDocument();
    expect(screen.queryByText("Selected Call Info:")).not.toBeInTheDocument();
  });

  it("fetches fresh call details when a user selects a call", async () => {
    const refreshedCall = {
      ...activeCall,
      duration: 180,
      notes: [{ id: "note-1", content: "Customer asked for a callback." }],
    };
    fetchCall.mockResolvedValue(refreshedCall);

    renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));

    expect(fetchCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("Selected Call Info:")).toBeInTheDocument();
    expect(screen.getByText("180 seconds")).toBeInTheDocument();
    expect(screen.getByText("Customer asked for a callback.")).toBeInTheDocument();
  });

  it("adds a note through the API and updates the selected call details", async () => {
    fetchCall.mockResolvedValue(activeCall);
    addCallNote.mockResolvedValue({
      ...activeCall,
      notes: [{ id: "note-2", content: "Escalated to billing." }],
    });

    renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));
    await screen.findByText("Selected Call Info:");

    await userEvent.type(screen.getByLabelText("Add note"), "Escalated to billing.");
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(addCallNote).toHaveBeenCalledWith("call-1", "Escalated to billing.");
    expect(await screen.findByText("Escalated to billing.")).toBeInTheDocument();
    expect(screen.getByText("Note added successfully.")).toBeInTheDocument();
  });

  it("rolls back an optimistic note when adding the note fails", async () => {
    fetchCall.mockResolvedValue(activeCall);
    addCallNote.mockRejectedValue(new Error("Note was rejected."));

    const { container } = renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));
    await screen.findByText("Selected Call Info:");

    await userEvent.type(screen.getByLabelText("Add note"), "This should roll back.");
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(addCallNote).toHaveBeenCalledWith("call-1", "This should roll back.");
    expect(await screen.findByText("Note was rejected.")).toBeInTheDocument();
    expect(
      within(container.querySelector(".details-table")).queryByText("This should roll back."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("No notes available for this call.")).toBeInTheDocument();
  });

  it("archives an active call through the API and removes it from the active feed", async () => {
    archiveCall.mockResolvedValue({
      ...activeCall,
      is_archived: true,
    });

    renderApp();

    const callCard = (await screen.findByText("+1 555-0100")).closest(".call-card");
    await userEvent.click(within(callCard).getByRole("button", { name: "Archive this call" }));

    expect(archiveCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("No calls available.")).toBeInTheDocument();
    expect(screen.getByText("Call archived successfully.")).toBeInTheDocument();
  });

  it("rolls back an optimistic archive when archiving fails", async () => {
    archiveCall.mockRejectedValue(new Error("Archive failed."));

    renderApp();

    const callCard = (await screen.findByText("+1 555-0100")).closest(".call-card");
    await userEvent.click(within(callCard).getByRole("button", { name: "Archive this call" }));

    expect(archiveCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("Archive failed.")).toBeInTheDocument();
    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
  });

  it("switches to archived calls and unarchives one call through the API", async () => {
    unarchiveCall.mockResolvedValue({
      ...archivedCall,
      is_archived: false,
    });

    renderApp();

    await userEvent.click(await screen.findByRole("button", { name: "View archived calls" }));

    expect(screen.getByRole("button", { name: "View active calls" })).toBeInTheDocument();
    const callCard = screen.getByText("+1 555-0200").closest(".call-card");
    await userEvent.click(within(callCard).getByRole("button", { name: "Unarchive this call" }));

    expect(unarchiveCall).toHaveBeenCalledWith("call-2");
    expect(await screen.findByText("No calls available.")).toBeInTheDocument();
    expect(screen.getByText("Call unarchived successfully.")).toBeInTheDocument();
  });

  it("unarchives all archived calls after confirmation", async () => {
    unarchiveAllCalls.mockResolvedValue(null);
    fetchAllCalls
      .mockResolvedValueOnce([activeCall, archivedCall])
      .mockResolvedValueOnce([activeCall, { ...archivedCall, is_archived: false }]);

    renderApp();

    await userEvent.click(await screen.findByRole("button", { name: "View archived calls" }));
    await userEvent.click(screen.getByRole("button", { name: "Unarchive all calls" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Unarchive all archived calls?");
    await userEvent.click(screen.getByRole("button", { name: "Unarchive all" }));

    expect(unarchiveAllCalls).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fetchAllCalls).toHaveBeenCalledTimes(2));
    expect(screen.getByText("All archived calls unarchived successfully.")).toBeInTheDocument();
  });

  it("archives all active calls after confirmation", async () => {
    archiveAllCalls.mockResolvedValue(null);
    fetchAllCalls
      .mockResolvedValueOnce([activeCall, archivedCall])
      .mockResolvedValueOnce([{ ...activeCall, is_archived: true }, archivedCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Archive all calls" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Archive all active calls?");
    await userEvent.click(screen.getByRole("button", { name: "Archive all" }));

    expect(archiveAllCalls).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fetchAllCalls).toHaveBeenCalledTimes(2));
    expect(screen.getByText("No calls available.")).toBeInTheDocument();
    expect(screen.getByText("All active calls archived successfully.")).toBeInTheDocument();
  });

  it("can cancel a bulk action confirmation without calling the API", async () => {
    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Archive all calls" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByText("Cancel"));

    expect(archiveAllCalls).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
  });

  it("resets calls after confirmation", async () => {
    const resetCall = createCall({
      id: "call-3",
      from: "+1 555-0300",
      to: "+1 555-0330",
    });
    resetCalls.mockResolvedValue({
      message: "Calls reset successfully",
      deletedCount: 4,
      insertedCount: 150,
    });
    fetchAllCalls.mockResolvedValueOnce([activeCall]).mockResolvedValueOnce([resetCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Reset calls to sample data" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Reset calls?");

    await userEvent.click(screen.getByRole("button", { name: "Reset calls" }));

    expect(resetCalls).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fetchAllCalls).toHaveBeenCalledTimes(2));
    expect(screen.getByText("+1 555-0300")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0100")).not.toBeInTheDocument();
    expect(screen.getByText("Calls reset successfully")).toBeInTheDocument();
  });

  it("deletes a selected call after confirmation", async () => {
    fetchCall.mockResolvedValue(activeCall);
    deleteCall.mockResolvedValue(null);

    renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));
    await screen.findByText("Selected Call Info:");
    await userEvent.click(screen.getByRole("button", { name: "Delete call" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Delete this call?");
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete call" }),
    );

    expect(deleteCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("No calls available.")).toBeInTheDocument();
    expect(screen.getByText("Call deleted successfully.")).toBeInTheDocument();
    expect(screen.queryByText("Selected Call Info:")).not.toBeInTheDocument();
  });

  it("searches calls by phone number", async () => {
    const secondActiveCall = createCall({
      id: "call-3",
      from: "+1 555-0300",
      to: "+1 555-0330",
    });
    fetchAllCalls.mockResolvedValue([activeCall, secondActiveCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.type(screen.getByLabelText("Search calls by phone number"), "0300");

    expect(screen.getByText("+1 555-0300")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0100")).not.toBeInTheDocument();
  });

  it("filters calls by call type", async () => {
    const missedActiveCall = createCall({
      id: "call-3",
      call_type: "missed",
      from: "+1 555-0300",
      to: "+1 555-0330",
    });
    fetchAllCalls.mockResolvedValue([activeCall, missedActiveCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    await userEvent.click(screen.getByLabelText("Answered"));
    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0300")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0100")).not.toBeInTheDocument();
  });

  it("changes page size and navigates through paginated calls", async () => {
    fetchAllCalls.mockResolvedValue(createCalls(12));

    renderApp();

    expect(await screen.findByText("+1 555-1001")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-1012")).not.toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByLabelText("Select how many calls to show per page"),
      "5",
    );

    expect(screen.getAllByText("Page 1 of 3")).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("button", { name: "Go to next page" })[0]);

    expect(screen.getAllByText("Page 2 of 3")).toHaveLength(2);
    expect(screen.queryByText("+1 555-1001")).not.toBeInTheDocument();
  });

  it("toggles between dark and light theme", async () => {
    const { container } = renderApp();

    await screen.findByText("+1 555-0100");
    expect(container.firstChild).toHaveAttribute("data-theme", "dark");

    await userEvent.click(screen.getByRole("button", { name: "Toggle light/dark theme" }));

    expect(container.firstChild).toHaveAttribute("data-theme", "light");
  });

  it("shows an empty state when the API returns no calls", async () => {
    fetchAllCalls.mockResolvedValue([]);

    renderApp();

    expect(await screen.findByText("No calls available.")).toBeInTheDocument();
  });

  it("shows an empty state when search or filters hide every call", async () => {
    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.type(screen.getByLabelText("Search calls by phone number"), "9999");

    expect(screen.getByText("No calls match the current search or filters.")).toBeInTheDocument();
  });

  it("filters calls by duration", async () => {
    const longCall = createCall({
      id: "call-3",
      duration: 300,
      from: "+1 555-0300",
      to: "+1 555-0330",
    });
    fetchAllCalls.mockResolvedValue([activeCall, longCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    fireEvent.change(screen.getByLabelText("Minimum call duration in seconds"), {
      target: { value: "200" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0300")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0100")).not.toBeInTheDocument();
  });
});
