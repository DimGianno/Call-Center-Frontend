import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { wakeBackend } from "../api/healthApi";
import { getCurrentSession, loginUser, signupUser } from "../api/authApi";
import App from "../App";
import type { AuthSession, Call, TutorialState } from "../types";
import { resetBackendWakeupForTests } from "../hooks/useBackendWakeup";
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
import { fetchTutorialState, updateTutorialState } from "../api/tutorialApi";

vi.mock("../api/authApi", () => {
  return {
    getCurrentSession: vi.fn(async () => {
      const storedSession = window.localStorage.getItem("call-center-demo-session");
      return storedSession ? JSON.parse(storedSession) : null;
    }),
    loginUser: vi.fn(),
    logoutUser: vi.fn(async () => {
      window.localStorage.removeItem("call-center-demo-session");
    }),
    refreshSession: vi.fn(async () => {
      const storedSession = window.localStorage.getItem("call-center-demo-session");
      const session = storedSession ? (JSON.parse(storedSession) as AuthSession) : null;
      const refreshedSession = {
        ...(session as AuthSession),
        sessionExpiresAt: new Date(Date.now() + 600_000).toISOString(),
      };
      window.localStorage.setItem("call-center-demo-session", JSON.stringify(refreshedSession));
      return refreshedSession;
    }),
    signupUser: vi.fn(),
  };
});

vi.mock("../api/healthApi", () => {
  return {
    wakeBackend: vi.fn(async () => {}),
  };
});

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

vi.mock("../api/tutorialApi", () => {
  return {
    fetchTutorialState: vi.fn(),
    updateTutorialState: vi.fn(),
  };
});

const addCallNoteMock = vi.mocked(addCallNote);
const archiveAllCallsMock = vi.mocked(archiveAllCalls);
const archiveCallMock = vi.mocked(archiveCall);
const deleteCallMock = vi.mocked(deleteCall);
const fetchAllCallsMock = vi.mocked(fetchAllCalls);
const fetchCallMock = vi.mocked(fetchCall);
const resetCallsMock = vi.mocked(resetCalls);
const unarchiveAllCallsMock = vi.mocked(unarchiveAllCalls);
const unarchiveCallMock = vi.mocked(unarchiveCall);
const wakeBackendMock = vi.mocked(wakeBackend);
const getCurrentSessionMock = vi.mocked(getCurrentSession);
const loginUserMock = vi.mocked(loginUser);
const signupUserMock = vi.mocked(signupUser);
const fetchTutorialStateMock = vi.mocked(fetchTutorialState);
const updateTutorialStateMock = vi.mocked(updateTutorialState);

function createSessionExpiresAt(durationMs = 600_000) {
  return new Date(Date.now() + durationMs).toISOString();
}

function createTutorialState(overrides: Partial<TutorialState> = {}): TutorialState {
  return {
    version: 1,
    hasSeenWelcome: true,
    completedAt: "2026-07-01T10:00:00.000Z",
    skippedAt: null,
    completedTopics: ["seeding", "ui", "call-feed", "call-item"],
    ...overrides,
  };
}

function mockTutorialState(overrides: Partial<TutorialState> = {}) {
  const tutorialState = createTutorialState(overrides);

  fetchTutorialStateMock.mockResolvedValue(tutorialState);
  updateTutorialStateMock.mockImplementation(async (update) => {
    return {
      ...tutorialState,
      ...update,
      completedTopics: update.completedTopics ?? tutorialState.completedTopics,
    };
  });

  return tutorialState;
}

const activeCall: Call = {
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

const archivedCall: Call = {
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

function createCall(overrides: Partial<Call> = {}): Call {
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

function createCalls(count: number) {
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

function seedAuthenticatedSession(overrides: Partial<AuthSession> = {}) {
  window.localStorage.setItem(
    "call-center-demo-session",
    JSON.stringify({
      user: {
        id: "user-1",
        name: "Test Agent",
        email: "agent@example.com",
      },
      name: "Test Agent",
      email: "agent@example.com",
      sessionExpiresAt: createSessionExpiresAt(),
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
    resetBackendWakeupForTests();
    fetchAllCallsMock.mockResolvedValue([activeCall, archivedCall]);
    mockTutorialState();
    loginUserMock.mockResolvedValue({
      user: {
        id: "user-login",
        name: "Stored Agent",
        email: "stored@example.com",
      },
      name: "Stored Agent",
      email: "stored@example.com",
      sessionExpiresAt: createSessionExpiresAt(),
    });
    signupUserMock.mockResolvedValue({
      user: {
        id: "user-signup",
        name: "Alex Agent",
        email: "alex@example.com",
      },
      name: "Alex Agent",
      email: "alex@example.com",
      sessionExpiresAt: createSessionExpiresAt(),
    });
  });

  it("renders the home page at the root route", async () => {
    renderApp("/");

    expect(screen.getByRole("heading", { name: "Call Center Dashboard" })).toBeInTheDocument();
    expect(screen.getByText(/Track active and archived calls/i)).toBeInTheDocument();
    await waitFor(() => expect(wakeBackendMock).toHaveBeenCalledTimes(1));
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it("navigates from the home page to login and signup routes", async () => {
    renderApp("/");

    await waitFor(() => expect(wakeBackendMock).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getAllByRole("link", { name: "Login" })[0]);

    expect(window.location.pathname).toBe("/login");
    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(wakeBackendMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("tab", { name: "Sign up" }));

    expect(window.location.pathname).toBe("/signup");
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(wakeBackendMock).toHaveBeenCalledTimes(1);
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
    await waitFor(() => expect(wakeBackendMock).toHaveBeenCalledTimes(1));
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it("keeps login usable while the startup session check is still pending", async () => {
    let resolveStartupSession: (session: AuthSession | null) => void = () => {};
    getCurrentSessionMock.mockImplementationOnce(
      () =>
        new Promise<AuthSession | null>((resolve) => {
          resolveStartupSession = resolve;
        }),
    );

    renderApp("/login");

    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeEnabled();
    expect(screen.getByLabelText("Password")).toBeEnabled();
    expect(screen.queryByText("Loading session...")).not.toBeInTheDocument();

    await act(async () => {
      resolveStartupSession(null);
      await Promise.resolve();
    });
  });

  it("does not let a late startup session check overwrite a successful login", async () => {
    let resolveStartupSession: (session: AuthSession | null) => void = () => {};
    getCurrentSessionMock.mockImplementationOnce(
      () =>
        new Promise<AuthSession | null>((resolve) => {
          resolveStartupSession = resolve;
        }),
    );

    renderApp("/login");

    await userEvent.type(await screen.findByLabelText("Email"), "stored@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(loginUser).toHaveBeenCalledWith({
      email: "stored@example.com",
      password: "password123",
    });

    await act(async () => {
      resolveStartupSession(null);
      await Promise.resolve();
    });

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("wakes the backend on the signup route", async () => {
    renderApp("/signup");

    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Sign up" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(wakeBackendMock).toHaveBeenCalledTimes(1));
    expect(fetchAllCalls).not.toHaveBeenCalled();
  });

  it.each([
    ["login", "/login"],
    ["signup", "/signup"],
  ])("shows live email guidance on the %s page", async (_mode, route) => {
    renderApp(route);

    const emailInput = await screen.findByLabelText("Email");
    const emailGuidance = document.getElementById("auth-email-guidance");

    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(emailInput).not.toHaveAttribute("aria-describedby");
    expect(emailGuidance).not.toHaveClass("is-visible");
    expect(emailGuidance).toHaveAttribute("aria-hidden", "true");

    await userEvent.type(emailInput, "agent");

    expect(
      screen.getByText("Use one @ and a complete address, such as name@example.com."),
    ).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "auth-email-guidance");
    expect(emailGuidance).toHaveClass("is-visible");
    expect(emailGuidance).toHaveAttribute("aria-hidden", "false");

    await userEvent.type(emailInput, "@example");

    expect(
      screen.getByText("Add a complete domain after @, such as example.com."),
    ).toBeInTheDocument();

    await userEvent.type(emailInput, ".com");

    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(emailInput).not.toHaveAttribute("aria-describedby");
    expect(emailGuidance).not.toHaveClass("is-visible");
    expect(emailGuidance).toHaveAttribute("aria-hidden", "true");

    const passwordInput = screen.getByLabelText("Password");
    const passwordGuidance = document.getElementById("auth-password-guidance");

    await userEvent.type(passwordInput, "short");

    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-describedby", "auth-password-guidance");
    expect(passwordGuidance).toHaveClass("is-visible");
    expect(passwordGuidance).toHaveAttribute("aria-hidden", "false");

    await userEvent.type(passwordInput, "123");

    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    expect(passwordInput).not.toHaveAttribute("aria-describedby");
    expect(passwordGuidance).not.toHaveClass("is-visible");
    expect(passwordGuidance).toHaveAttribute("aria-hidden", "true");
  });

  it("shows inline email and password guidance after an empty login submission", async () => {
    renderApp("/login");

    await screen.findByRole("heading", { name: "Dashboard Access" });
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(loginUserMock).not.toHaveBeenCalled();
  });

  it("blocks malformed email submission and submits a trimmed valid email", async () => {
    renderApp("/login");

    const emailInput = await screen.findByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await userEvent.type(emailInput, "user..name@example.com");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(loginUserMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "The part before @ cannot start or end with a dot or contain consecutive dots.",
      ),
    ).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: "  stored@example.com  " } });
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(loginUserMock).toHaveBeenCalledWith({
      email: "stored@example.com",
      password: "password123",
    });
  });

  it("signs up through the backend auth API, enters the dashboard, and starts the timer", async () => {
    renderApp("/signup");

    await userEvent.type(await screen.findByLabelText("Name"), "Alex Agent");
    await userEvent.type(screen.getByLabelText("Email"), "alex@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(signupUser).toHaveBeenCalledWith({
      name: "Alex Agent",
      email: "alex@example.com",
      password: "password123",
    });
    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
    expect(fetchAllCalls).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    expect(screen.getByRole("dialog", { name: "Alex Agent" })).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Session time remaining" })).toHaveTextContent(
      "10:00",
    );
  });

  it("logs in through the backend auth API", async () => {
    renderApp("/login");

    await userEvent.type(await screen.findByLabelText("Email"), "stored@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(loginUser).toHaveBeenCalledWith({
      email: "stored@example.com",
      password: "password123",
    });
    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    expect(screen.getByRole("dialog", { name: "Stored Agent" })).toBeInTheDocument();
  });

  it("shows rotating loading feedback while waiting for login", async () => {
    renderApp("/login");

    const emailInput = await screen.findByLabelText("Email");
    let resolveLogin: (session: AuthSession) => void = () => {};
    loginUserMock.mockImplementationOnce(
      () =>
        new Promise<AuthSession>((resolve) => {
          resolveLogin = resolve;
        }),
    );
    vi.useFakeTimers();

    fireEvent.change(emailInput, {
      target: { value: "stored@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    const submitButton = screen.getByRole("button", { name: "Waking up the server..." });

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton.querySelector(".auth-loading-spinner")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(2600);
    });

    expect(screen.getByRole("button", { name: "Almost there..." })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2600);
    });

    expect(screen.getByRole("button", { name: "Just a moment..." })).toBeInTheDocument();

    await act(async () => {
      resolveLogin({
        user: {
          id: "user-login",
          name: "Stored Agent",
          email: "stored@example.com",
        },
        name: "Stored Agent",
        email: "stored@example.com",
        sessionExpiresAt: createSessionExpiresAt(),
      });
      await Promise.resolve();
    });
  });

  it("redirects logged-in users away from public auth routes", async () => {
    seedAuthenticatedSession();

    renderApp("/login");

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
  });

  it("shows validation and login errors without entering the dashboard", async () => {
    loginUserMock.mockRejectedValueOnce(new Error("Invalid email or password"));

    renderApp("/login");

    await userEvent.type(await screen.findByLabelText("Email"), "missing@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
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

  it("opens and closes the account drawer from the dashboard header", async () => {
    seedAuthenticatedSession();

    renderApp("/dashboard");

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));

    expect(screen.getByRole("dialog", { name: "Test Agent" })).toBeInTheDocument();
    expect(screen.getByText("agent@example.com")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Test Agent" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    await userEvent.click(screen.getByRole("button", { name: "Dismiss account settings" }));

    expect(screen.queryByRole("dialog", { name: "Test Agent" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    await userEvent.click(screen.getByRole("button", { name: "Close account settings" }));

    expect(screen.queryByRole("dialog", { name: "Test Agent" })).not.toBeInTheDocument();
  });

  it("logs out from the account drawer", async () => {
    seedAuthenticatedSession();

    renderApp("/dashboard");

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });

  it("treats server-side session expiry as a logout", async () => {
    seedAuthenticatedSession();

    renderApp("/dashboard");

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("call-center-auth-session-expired"));
    });

    expect(await screen.findByRole("heading", { name: "Dashboard Access" })).toBeInTheDocument();
    expect(screen.getByText("Your session expired. Please log in again.")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });
});

describe("App API-backed user flows", () => {
  beforeEach(() => {
    window.localStorage.clear();
    seedAuthenticatedSession();
    vi.clearAllMocks();
    fetchAllCallsMock.mockResolvedValue([activeCall, archivedCall]);
    mockTutorialState();
  });

  it("loads calls from the API and renders the active call feed", async () => {
    renderApp();

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();

    expect(fetchAllCalls).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("+1 555-0200")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View archived calls" })).toBeInTheDocument();
  });

  it("shows the first-run tutorial welcome and lets users skip it", async () => {
    mockTutorialState({
      hasSeenWelcome: false,
      completedAt: null,
      skippedAt: null,
      completedTopics: [],
    });

    renderApp();

    expect(
      await screen.findByRole("dialog", { name: "Welcome to your call center dashboard" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Not now" }));

    await waitFor(() => {
      expect(updateTutorialStateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
          hasSeenWelcome: true,
          skippedAt: expect.any(String),
        }),
      );
    });
    expect(
      screen.queryByRole("dialog", { name: "Welcome to your call center dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("does not show the first-run tutorial welcome for returning users", async () => {
    renderApp();

    expect(await screen.findByText("+1 555-0100")).toBeInTheDocument();
    expect(fetchTutorialStateMock).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: "Welcome to your call center dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("completes the full tutorial after safe click-along actions", async () => {
    fetchCallMock.mockResolvedValue(activeCall);
    mockTutorialState({
      hasSeenWelcome: false,
      completedAt: null,
      skippedAt: null,
      completedTopics: [],
    });

    renderApp();

    await userEvent.click(
      await screen.findByRole("button", {
        name: "Start tutorial",
      }),
    );

    expect(screen.getByRole("dialog", { name: "Understand the layout" })).toBeInTheDocument();
    expect(document.querySelector('[data-tutorial-active="true"]')).toBeNull();
    expect(screen.queryByRole("dialog", { name: "Seed sample calls" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Read the session timer" })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector('[data-tutorial-active="true"]')).not.toBeNull();
    });

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Open account settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    expect(
      await screen.findByRole("dialog", { name: "Use the account drawer" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Close account settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Close account settings" }));

    expect(await screen.findByRole("dialog", { name: "Read the stats cards" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Search calls" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Change page size" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("dialog", { name: "Switch active and archived calls" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Open filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    expect(await screen.findByRole("dialog", { name: "Filter calls" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Close filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Close filter modal" }));

    expect(await screen.findByRole("dialog", { name: "Bulk actions" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Use pagination" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Reset sample data" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Read the call feed" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Open call details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await userEvent.click(screen.getByText("+1 555-0100"));
    expect(await screen.findByText("Selected Call Info:")).toBeInTheDocument();
    expect(await screen.findByRole("dialog", { name: "Review a call" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Update a call" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Finish" }));

    await waitFor(() => {
      expect(updateTutorialStateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
          hasSeenWelcome: true,
          completedAt: expect.any(String),
          completedTopics: ["seeding", "ui", "call-feed", "call-item"],
        }),
      );
    });
  });

  it("lets users rerun tutorial topics from the account drawer", async () => {
    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));

    const tutorialsToggle = screen.getByRole("button", { name: "Tutorials Completed" });
    const tutorialList = document.getElementById("drawer-tutorial-list");

    expect(tutorialsToggle).toHaveAttribute("aria-expanded", "false");
    expect(tutorialList).toHaveClass("is-collapsed");
    expect(screen.queryByRole("button", { name: /Full tutorial/i })).not.toBeInTheDocument();

    await userEvent.click(tutorialsToggle);

    expect(tutorialsToggle).toHaveAttribute("aria-expanded", "true");
    expect(tutorialList).toHaveClass("is-open");
    expect(screen.getByRole("button", { name: "Full tutorial Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seeding calls Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "UI Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Call feed Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Call item Completed" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "UI Completed" }));

    expect(screen.getByRole("dialog", { name: "Understand the layout" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Test Agent" })).not.toBeInTheDocument();
  });

  it("marks unfinished tutorial topics as not started in the account drawer", async () => {
    mockTutorialState({
      completedAt: null,
      completedTopics: ["ui"],
      skippedAt: "2026-07-01T11:00:00.000Z",
    });

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    await userEvent.click(screen.getByRole("button", { name: "Tutorials" }));

    expect(screen.getByRole("button", { name: "Full tutorial Not started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Seeding calls Not started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "UI Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Call feed Not started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Call item Not started" })).toBeInTheDocument();
  });

  it("shows an API error when calls fail to load", async () => {
    fetchAllCallsMock.mockRejectedValue(new Error("Unable to load calls."));

    renderApp();

    expect(await screen.findByText("Unable to load calls.")).toBeInTheDocument();
    expect(screen.getByText("No active calls available.")).toBeInTheDocument();
  });

  it("shows an API error when selected call details fail to load", async () => {
    fetchCallMock.mockRejectedValue(new Error("Unable to load call details."));

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
    fetchCallMock.mockResolvedValue(refreshedCall);

    renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));

    expect(fetchCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("Selected Call Info:")).toBeInTheDocument();
    expect(screen.getByText("180 seconds")).toBeInTheDocument();
    expect(screen.getByText("Customer asked for a callback.")).toBeInTheDocument();
  });

  it("adds a note through the API and updates the selected call details", async () => {
    fetchCallMock.mockResolvedValue(activeCall);
    addCallNoteMock.mockResolvedValue({
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
    fetchCallMock.mockResolvedValue(activeCall);
    addCallNoteMock.mockRejectedValue(new Error("Note was rejected."));

    const { container } = renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));
    await screen.findByText("Selected Call Info:");

    await userEvent.type(screen.getByLabelText("Add note"), "This should roll back.");
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(addCallNote).toHaveBeenCalledWith("call-1", "This should roll back.");
    expect(await screen.findByText("Note was rejected.")).toBeInTheDocument();
    expect(
      within(container.querySelector(".details-table") as HTMLElement).queryByText(
        "This should roll back.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText("No notes available for this call.")).toBeInTheDocument();
  });

  it("archives an active call through the API and removes it from the active feed", async () => {
    archiveCallMock.mockResolvedValue({
      ...activeCall,
      is_archived: true,
    });

    renderApp();

    const callCard = (await screen.findByText("+1 555-0100")).closest(".call-card") as HTMLElement;
    await userEvent.click(within(callCard).getByRole("button", { name: "Archive this call" }));

    expect(archiveCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("No active calls available.")).toBeInTheDocument();
    expect(screen.getByText("Call archived successfully.")).toBeInTheDocument();
  });

  it("rolls back an optimistic archive when archiving fails", async () => {
    archiveCallMock.mockRejectedValue(new Error("Archive failed."));

    renderApp();

    const callCard = (await screen.findByText("+1 555-0100")).closest(".call-card") as HTMLElement;
    await userEvent.click(within(callCard).getByRole("button", { name: "Archive this call" }));

    expect(archiveCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("Archive failed.")).toBeInTheDocument();
    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
  });

  it("switches to archived calls and unarchives one call through the API", async () => {
    unarchiveCallMock.mockResolvedValue({
      ...archivedCall,
      is_archived: false,
    });

    renderApp();

    await userEvent.click(await screen.findByRole("button", { name: "View archived calls" }));

    expect(screen.getByRole("button", { name: "View active calls" })).toBeInTheDocument();
    const callCard = screen.getByText("+1 555-0200").closest(".call-card") as HTMLElement;
    await userEvent.click(within(callCard).getByRole("button", { name: "Unarchive this call" }));

    expect(unarchiveCall).toHaveBeenCalledWith("call-2");
    expect(await screen.findByText("No archived calls available.")).toBeInTheDocument();
    expect(screen.getByText("Call unarchived successfully.")).toBeInTheDocument();
  });

  it("unarchives all archived calls after confirmation", async () => {
    unarchiveAllCallsMock.mockResolvedValue(null);
    fetchAllCallsMock
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
    archiveAllCallsMock.mockResolvedValue(null);
    fetchAllCallsMock
      .mockResolvedValueOnce([activeCall, archivedCall])
      .mockResolvedValueOnce([{ ...activeCall, is_archived: true }, archivedCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Archive all calls" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Archive all active calls?");
    await userEvent.click(screen.getByRole("button", { name: "Archive all" }));

    expect(archiveAllCalls).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fetchAllCalls).toHaveBeenCalledTimes(2));
    expect(screen.getByText("No active calls available.")).toBeInTheDocument();
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
    resetCallsMock.mockResolvedValue({
      message: "Calls reset successfully",
      deletedCount: 4,
      insertedCount: 150,
    });
    fetchAllCallsMock.mockResolvedValueOnce([activeCall]).mockResolvedValueOnce([resetCall]);

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
    fetchCallMock.mockResolvedValue(activeCall);
    deleteCallMock.mockResolvedValue(null);

    renderApp();

    await userEvent.click(await screen.findByText("+1 555-0100"));
    await screen.findByText("Selected Call Info:");
    await userEvent.click(screen.getByRole("button", { name: "Delete call" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Delete this call?");
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete call" }),
    );

    expect(deleteCall).toHaveBeenCalledWith("call-1");
    expect(await screen.findByText("No active calls available.")).toBeInTheDocument();
    expect(screen.getByText("Call deleted successfully.")).toBeInTheDocument();
    expect(screen.queryByText("Selected Call Info:")).not.toBeInTheDocument();
  });

  it("searches calls by phone number", async () => {
    const secondActiveCall = createCall({
      id: "call-3",
      from: "+1 555-0300",
      to: "+1 555-0330",
    });
    fetchAllCallsMock.mockResolvedValue([activeCall, secondActiveCall]);

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
    fetchAllCallsMock.mockResolvedValue([activeCall, missedActiveCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    expect(screen.getByRole("button", { name: "Call Type" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(document.getElementById("filter-section-call-type")).toHaveAttribute("hidden");
    await userEvent.click(screen.getByRole("button", { name: "Call Type" }));
    expect(screen.getByRole("button", { name: "Call Type" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(document.getElementById("filter-section-call-type")).not.toHaveAttribute("hidden");
    await userEvent.click(screen.getByLabelText("Answered"));
    await userEvent.click(screen.getByRole("button", { name: "Call Type" }));
    expect(screen.getByRole("button", { name: "Call Type" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await userEvent.click(screen.getByRole("button", { name: "Call Type" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0300")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0100")).not.toBeInTheDocument();
  });

  it("filters calls with the calendar date range picker", async () => {
    const olderCall = createCall({
      id: "call-older",
      from: "+1 555-0600",
      to: "+1 555-0660",
      created_at: "2026-06-06T10:00:00.000Z",
    });
    const newerCall = createCall({
      id: "call-newer",
      from: "+1 555-1000",
      to: "+1 555-1010",
      created_at: "2026-06-10T11:30:00.000Z",
    });
    fetchAllCallsMock.mockResolvedValue([activeCall, olderCall, newerCall]);

    const { container } = renderApp();

    function getCalendarDay(day: number) {
      const dayElement = container.querySelector(
        `.date-range-calendar .react-datepicker__day--${String(day).padStart(3, "0")}`,
      );

      expect(dayElement).not.toBeNull();

      return dayElement as HTMLElement;
    }

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    await userEvent.click(screen.getByRole("button", { name: "Date Range" }));

    const newerDate = getCalendarDay(10);
    const activeDate = getCalendarDay(7);
    const olderDate = getCalendarDay(6);
    const unavailableDate = getCalendarDay(8);

    expect(newerDate).not.toHaveClass("react-datepicker__day--disabled");
    expect(activeDate).not.toHaveClass("react-datepicker__day--disabled");
    expect(olderDate).not.toHaveClass("react-datepicker__day--disabled");
    expect(unavailableDate).toHaveClass("react-datepicker__day--disabled");
    expect(screen.getByText("Any date")).toBeInTheDocument();

    await userEvent.click(activeDate);

    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0600")).not.toBeInTheDocument();
    expect(screen.queryByText("+1 555-1000")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    await userEvent.click(screen.getByRole("button", { name: "Date Range" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear date range" }));
    await userEvent.click(getCalendarDay(10));
    await userEvent.click(getCalendarDay(7));

    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
    expect(screen.getByText("+1 555-1000")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0600")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    await userEvent.click(screen.getByRole("button", { name: "Date Range" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear date range" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
    expect(screen.getByText("+1 555-0600")).toBeInTheDocument();
    expect(screen.getByText("+1 555-1000")).toBeInTheDocument();
  });

  it("changes page size and navigates through paginated calls", async () => {
    fetchAllCallsMock.mockResolvedValue(createCalls(12));

    renderApp();

    expect(await screen.findByText("+1 555-1001")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-1012")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show 5 calls per page" }));

    expect(screen.getAllByText("Page 1 of 3")).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("button", { name: "Go to next page" })[0]);

    expect(screen.getAllByText("Page 2 of 3")).toHaveLength(2);
    expect(screen.queryByText("+1 555-1001")).not.toBeInTheDocument();
  });

  it("toggles between dark and light theme", async () => {
    const { container } = renderApp();

    await screen.findByText("+1 555-0100");
    expect(container.firstChild).toHaveAttribute("data-theme", "dark");

    await userEvent.click(screen.getByRole("button", { name: "Open account settings" }));
    await userEvent.click(screen.getByRole("button", { name: "Toggle light/dark theme" }));

    expect(container.firstChild).toHaveAttribute("data-theme", "light");
  });

  it("guides new users to seed sample calls", async () => {
    resetCallsMock.mockResolvedValue({ insertedCount: 150 });
    fetchAllCallsMock.mockResolvedValueOnce([]).mockResolvedValueOnce([activeCall]);

    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Get started with sample calls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/confirm to populate the dashboard with demo call data/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Seed sample calls" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Seed sample calls?");
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "This will populate your dashboard with sample call data.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Seed calls" }));

    expect(resetCallsMock).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(fetchAllCallsMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText("+1 555-0100")).toBeInTheDocument();
    expect(screen.getByText("Sample calls added successfully.")).toBeInTheDocument();
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
    fetchAllCallsMock.mockResolvedValue([activeCall, longCall]);

    renderApp();

    await screen.findByText("+1 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }));
    await userEvent.click(screen.getByRole("button", { name: "Duration" }));
    fireEvent.change(screen.getByLabelText("Minimum call duration in seconds"), {
      target: { value: "200" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Confirm filters" }));

    expect(screen.getByText("+1 555-0300")).toBeInTheDocument();
    expect(screen.queryByText("+1 555-0100")).not.toBeInTheDocument();
  });
});
