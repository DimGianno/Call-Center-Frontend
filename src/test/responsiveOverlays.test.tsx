import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CallDetails from "../components/CallDetails";
import ConfirmDialog from "../components/ConfirmDialog";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import FilterModal from "../components/FilterModal";
import Toast from "../components/Toast";
import type { Call } from "../types";
import { defaultFilters } from "../utils/callUtils";

const longToken = "1234567890".repeat(18);
const longCall: Call = {
  id: "call-responsive",
  direction: "inbound",
  from: `+${longToken}`,
  to: `+${longToken}`,
  call_type: "answered",
  duration: 9876,
  created_at: "2026-07-10T12:30:00.000Z",
  is_archived: false,
  notes: [{ id: "note-responsive", content: longToken }],
};

const callDetailsProps = {
  call: longCall,
  onAddNote: vi.fn(async () => true),
  onArchiveCall: vi.fn(async () => true),
  onClose: vi.fn(),
  onDeleteCall: vi.fn(() => false),
  onDeleteNote: vi.fn(() => false),
  onUnarchiveCall: vi.fn(async () => true),
};

function ConfirmDialogHarness() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <ConfirmDialog
      title="Reset calls?"
      message={longToken}
      confirmLabel="Reset calls"
      isProcessing={false}
      onCancel={() => setIsOpen(false)}
      onConfirm={vi.fn()}
    />
  );
}

describe("responsive overlay behavior", () => {
  it("renders long call details in the shared responsive modal surface", () => {
    const { unmount } = render(<CallDetails {...callDetailsProps} />);
    const dialog = screen.getByRole("dialog", { name: "Selected Call Info:" });

    expect(dialog).toHaveClass("modal-surface", "call-details-modal");
    expect(screen.getAllByText(`+${longToken}`)).toHaveLength(2);
    expect(screen.getByText(longToken)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close call details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive call" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete call" })).toBeInTheDocument();
    expect(dialog.querySelector(".details-actions")).toHaveClass("modal-actions");
    expect(document.body).toHaveClass("is-scroll-locked");

    unmount();
    expect(document.body).not.toHaveClass("is-scroll-locked");
  });

  it("closes a confirmation dialog and removes its body scroll lock", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialogHarness />);
    const dialog = screen.getByRole("dialog", { name: "Reset calls?" });
    const actions = dialog.querySelector(".confirm-actions");

    expect(dialog).toHaveClass("modal-surface", "confirm-dialog");
    expect(actions).toHaveClass("modal-actions");
    expect(screen.getByText(longToken)).toBeInTheDocument();
    expect(document.body).toHaveClass("is-scroll-locked");

    await user.click(within(actions as HTMLElement).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog", { name: "Reset calls?" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass("is-scroll-locked");
  });

  it("keeps body scrolling locked until nested dialogs have all closed", () => {
    const details = render(<CallDetails {...callDetailsProps} />);
    const confirmation = render(
      <ConfirmDialog
        title="Delete this call?"
        message="This action cannot be undone."
        confirmLabel="Delete call"
        isProcessing={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(document.body).toHaveClass("is-scroll-locked");
    confirmation.unmount();
    expect(document.body).toHaveClass("is-scroll-locked");
    details.unmount();
    expect(document.body).not.toHaveClass("is-scroll-locked");
  });

  it("marks filter dialogs and action areas with shared responsive classes", () => {
    render(
      <FilterModal
        activeTutorialTarget={null}
        availableCallDates={[{ label: "Jul 10, 2026", value: "2026-07-10" }]}
        draftFilters={defaultFilters}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onDraftFiltersChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Filter Calls" });

    expect(dialog).toHaveClass("modal-surface", "filter-modal");
    expect(dialog.querySelector(".filter-actions")).toHaveClass("modal-actions");
    expect(screen.getByRole("button", { name: "Close filter modal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm filters" })).toBeInTheDocument();
  });

  it("keeps long toast and banner content in the DOM with responsive content classes", () => {
    render(<Toast message={longToken} type="error" onDismiss={vi.fn()} />);
    render(
      <EmailVerificationBanner
        email={`${"a".repeat(63)}@${"b".repeat(63)}.example`}
        emailVerification={{
          verified: false,
          verifiedAt: null,
          requiredAt: "2026-07-20T10:00:00.000Z",
          gracePeriodExpired: false,
        }}
        showToast={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveClass("toast", "toast-error");
    expect(screen.getByText(longToken)).toHaveClass("toast-message");
    expect(screen.getByLabelText("Email verification notice")).toHaveClass(
      "email-verification-banner",
    );
    expect(document.querySelector(".email-verification-content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dismiss notification" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend email" })).toBeInTheDocument();
  });
});
