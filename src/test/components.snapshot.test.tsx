import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CallItem from "../components/CallItem";
import ConfirmDialog from "../components/ConfirmDialog";
import PaginationControls from "../components/PaginationControls";
import StatsCards from "../components/StatsCards";
import Toast from "../components/Toast";
import type { Call } from "../types";

describe("component snapshots", () => {
  it("matches the success toast snapshot", () => {
    const { asFragment } = render(
      <Toast message="Call archived successfully." type="success" onDismiss={vi.fn()} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches the normal confirmation dialog snapshot", () => {
    const { asFragment } = render(
      <ConfirmDialog
        title="Reload calls?"
        message="This will refresh the list from the backend and close any selected call."
        confirmLabel="Reload calls"
        isDanger={false}
        isProcessing={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches the danger processing confirmation dialog snapshot", () => {
    const { asFragment } = render(
      <ConfirmDialog
        title="Delete this call?"
        message="This call will be permanently removed from the dashboard."
        confirmLabel="Delete call"
        isDanger
        isProcessing
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches the pagination controls snapshot", () => {
    const { asFragment } = render(
      <PaginationControls
        currentPage={2}
        totalPages={5}
        onPreviousPage={vi.fn()}
        onNextPage={vi.fn()}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches the stats cards snapshot", () => {
    const calls: Call[] = [
      {
        id: "call-1",
        direction: "inbound",
        from: "+1 555-0100",
        to: "+1 555-0110",
        call_type: "answered",
        duration: 120,
        created_at: "2026-06-07T08:30:00",
        is_archived: false,
      },
      {
        id: "call-2",
        direction: "outbound",
        from: "+1 555-0200",
        to: "+1 555-0220",
        call_type: "missed",
        duration: 45,
        created_at: "2026-06-07T09:30:00",
        is_archived: false,
      },
      {
        id: "call-3",
        direction: "inbound",
        from: "+1 555-0300",
        to: "+1 555-0330",
        call_type: "voicemail",
        duration: 80,
        created_at: "2026-06-07T10:30:00",
        is_archived: false,
      },
    ];

    const { asFragment } = render(<StatsCards calls={calls} callView="active" />);

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches the call item snapshot", () => {
    const call: Call = {
      id: "call-1",
      direction: "inbound",
      from: "+1 555-0100",
      to: "+1 555-0110",
      call_type: "answered",
      duration: 120,
      created_at: "2026-06-07T08:30:00",
      is_archived: false,
    };

    const { asFragment } = render(
      <CallItem call={call} actionLabel="Archive" onSelectCall={vi.fn()} onAction={vi.fn()} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
