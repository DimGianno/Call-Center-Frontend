import type { FormEvent } from "react";
import { useState } from "react";
import type { Call } from "../types";
import { formatCallDateTime } from "../utils/formatters";

interface CallDetailsProps {
  call: Call;
  isTutorialActionsActive?: boolean;
  isTutorialSummaryActive?: boolean;
  onClose: () => void;
  onAddNote: (callId: string, content: string) => Promise<boolean>;
  onTutorialNoteTyped?: () => void;
  onArchiveCall: (callId: string) => Promise<boolean>;
  onUnarchiveCall: (callId: string) => Promise<boolean>;
  onDeleteCall: (callId: string) => boolean;
}

type PendingAction = "" | "note" | "archive" | "delete";

function CallDetails({
  call,
  isTutorialActionsActive = false,
  isTutorialSummaryActive = false,
  onClose,
  onAddNote,
  onTutorialNoteTyped,
  onArchiveCall,
  onUnarchiveCall,
  onDeleteCall,
}: CallDetailsProps) {
  const [noteContent, setNoteContent] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>("");
  const formattedDate = formatCallDateTime(call.created_at);
  const isSubmittingNote = pendingAction === "note";
  const isArchiveActionPending = pendingAction === "archive";
  const isDeleting = pendingAction === "delete";
  const isBusy = pendingAction !== "";

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = noteContent.trim();

    if (trimmedNote === "") {
      return;
    }

    setPendingAction("note");
    const wasAdded = await onAddNote(call.id, trimmedNote);
    setPendingAction("");

    if (wasAdded) {
      setNoteContent("");
    }
  }

  async function handleArchiveToggle() {
    setPendingAction("archive");
    const wasUpdated = call.is_archived
      ? await onUnarchiveCall(call.id)
      : await onArchiveCall(call.id);

    if (!wasUpdated) {
      setPendingAction("");
    }
  }

  async function handleDeleteCall() {
    setPendingAction("delete");
    const wasDeleted = await onDeleteCall(call.id);

    if (!wasDeleted) {
      setPendingAction("");
    }
  }

  return (
    <div className="modal-overlay">
      <div className="call-details-modal">
        <div className="modal-header">
          <h2>Selected Call Info:</h2>
          <button
            className="close-button"
            title="Close call details"
            aria-label="Close call details"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <table
          className="details-table"
          data-tutorial-active={isTutorialSummaryActive ? "true" : undefined}
        >
          <tbody>
            <tr>
              <th>
                <strong>Direction:</strong>
              </th>
              <td>{call.direction}</td>
            </tr>
            <tr>
              <th>
                <strong>From:</strong>
              </th>
              <td>{call.from}</td>
            </tr>
            <tr>
              <th>
                <strong>To:</strong>
              </th>
              <td>{call.to}</td>
            </tr>
            <tr>
              <th>
                <strong>Type:</strong>
              </th>
              <td>{call.call_type}</td>
            </tr>
            <tr>
              <th>
                <strong>Duration:</strong>
              </th>
              <td>{call.duration} seconds</td>
            </tr>
            <tr>
              <th>
                <strong>Date:</strong>
              </th>
              <td>{formattedDate}</td>
            </tr>
            <tr>
              <th>
                <strong>Notes:</strong>
              </th>
              <td>
                {call.notes && call.notes.length > 0 ? (
                  <ul className="details-notes">
                    {call.notes.map((note) => (
                      <li key={note.id}>{note.content}</li>
                    ))}
                  </ul>
                ) : (
                  <span>No notes available for this call.</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          className="call-update-section"
          data-tutorial-active={isTutorialActionsActive ? "true" : undefined}
        >
          <form className="details-note-form" onSubmit={handleAddNote}>
            <label htmlFor="call-note">Add note</label>
            <textarea
              id="call-note"
              value={noteContent}
              placeholder="Write a note for this call..."
              disabled={isBusy}
              onChange={(event) => {
                setNoteContent(event.target.value);

                if (event.target.value.trim() !== "") {
                  onTutorialNoteTyped?.();
                }
              }}
            />
            <button
              className="primary-button"
              type="submit"
              disabled={isBusy || noteContent.trim() === ""}
            >
              {isSubmittingNote ? "Adding..." : "Add note"}
            </button>
          </form>

          <div className="details-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={isBusy}
              onClick={handleArchiveToggle}
            >
              {isArchiveActionPending
                ? call.is_archived
                  ? "Unarchiving..."
                  : "Archiving..."
                : call.is_archived
                  ? "Unarchive call"
                  : "Archive call"}
            </button>
            <button
              className="danger-button"
              type="button"
              disabled={isBusy}
              onClick={handleDeleteCall}
            >
              {isDeleting ? "Deleting..." : "Delete call"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallDetails;
