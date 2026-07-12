import type { Page, Route } from "@playwright/test";

interface MockDashboardOptions {
  showRelease?: boolean;
  showWelcome?: boolean;
}

export const longUnbrokenText = "1234567890".repeat(18);

export const detailedCall = {
  id: "call-1",
  direction: "inbound",
  from: `+${longUnbrokenText}`,
  to: `+${longUnbrokenText}`,
  call_type: "answered",
  duration: 9876,
  created_at: "2026-07-10T12:30:00.000Z",
  is_archived: false,
  notes: [
    { id: "note-1", content: longUnbrokenText },
    { id: "note-2", content: "A normal long note ".repeat(30) },
  ],
} as const;

const session = {
  user: {
    id: "responsive-user",
    name: "Responsive Test Agent With A Very Long Account Name",
    email: `${"a".repeat(63)}@${"b".repeat(63)}.example`,
    email_verified_at: null,
    email_verification_required_at: "2026-07-20T10:00:00.000Z",
    email_verification_sent_at: null,
  },
  emailVerification: {
    verified: false,
    verifiedAt: null,
    requiredAt: "2026-07-20T10:00:00.000Z",
    gracePeriodExpired: false,
  },
  sessionExpiresAt: "2099-07-20T10:00:00.000Z",
};

const calls = Array.from({ length: 12 }, (_, index) => {
  return {
    ...detailedCall,
    id: `call-${index + 1}`,
    from: index === 0 ? detailedCall.from : `+1 555-10${String(index).padStart(2, "0")}`,
    to: index === 0 ? detailedCall.to : `+1 555-20${String(index).padStart(2, "0")}`,
    notes: index === 0 ? detailedCall.notes : [],
    created_at: `2026-07-${String(10 - Math.min(index, 8)).padStart(2, "0")}T12:30:00.000Z`,
  };
});

function fulfillJson(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function mockDashboardApi(
  page: Page,
  { showRelease = false, showWelcome = false }: MockDashboardOptions = {},
) {
  await page.route("https://va.vercel-scripts.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });

  let selectedCall = {
    ...detailedCall,
    notes: [...detailedCall.notes],
  };
  let tutorialState = {
    version: showRelease ? 1 : 2,
    hasSeenWelcome: !showWelcome,
    completedAt: null,
    skippedAt: showWelcome ? null : "2026-07-01T00:00:00.000Z",
    completedTopics: [] as string[],
    newTopics: showRelease ? ["call-item"] : ([] as string[]),
  };

  const apiRequestPattern =
    /^https?:\/\/[^/]+\/(?:api\/)?(?:auth|health|users|events|calls)(?:\/|\?|$)/;

  await page.route(apiRequestPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    const path = url.pathname.replace(/^\/api/, "");

    if (path === "/auth/refresh") {
      await fulfillJson(route, session);
      return;
    }

    if (path === "/auth/resend-verification") {
      await fulfillJson(route, { message: "Verification email sent." });
      return;
    }

    if (path === "/health") {
      await fulfillJson(route, { status: "ok" });
      return;
    }

    if (path === "/users/me/tutorial" && request.method() === "GET") {
      await fulfillJson(route, tutorialState);
      return;
    }

    if (path === "/users/me/tutorial" && request.method() === "PATCH") {
      tutorialState = {
        ...tutorialState,
        ...(request.postDataJSON() as Partial<typeof tutorialState>),
      };
      await fulfillJson(route, tutorialState);
      return;
    }

    if (path === "/events/calls") {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: ": connected\n\n",
      });
      return;
    }

    if (path === "/calls" && request.method() === "GET") {
      const isArchived = url.searchParams.get("is_archived") === "true";
      await fulfillJson(route, {
        calls: isArchived ? [] : calls,
        pagination: { totalPages: 1 },
      });
      return;
    }

    if (/^\/calls\/[^/]+$/.test(path) && request.method() === "GET") {
      await fulfillJson(route, selectedCall);
      return;
    }

    const deleteNoteMatch = path.match(/^\/calls\/[^/]+\/notes\/([^/]+)$/);
    if (deleteNoteMatch && request.method() === "DELETE") {
      selectedCall = {
        ...selectedCall,
        notes: selectedCall.notes.filter((note) => note.id !== deleteNoteMatch[1]),
      };
      await fulfillJson(route, selectedCall);
      return;
    }

    if (path.startsWith("/calls")) {
      await fulfillJson(route, selectedCall);
      return;
    }

    await fulfillJson(route, { error: `Unhandled mock API request: ${path}` }, 500);
  });
}
