import { useState } from "react";
import { formatCallDateTime } from "../utils/formatters";

function CallDetails({ 
  call, 
  onClose, 
  onAddNote, 
  onArchiveCall, 
  onDeleteCall 
}) {
    const [noteContent, setNoteContent] = useState("");
    const [pendingAction, setPendingAction] = useState("");
    const formattedDate = formatCallDateTime(call.created_at);
    const isSubmittingNote = pendingAction === "note";
    const isArchiving = pendingAction === "archive";
    const isDeleting = pendingAction === "delete";
    const isBusy = pendingAction !== "";

    async function handleAddNote(event) {
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

    async function handleArchiveCall() {
      setPendingAction("archive");
      const wasArchived = await onArchiveCall(call.id);

      if (!wasArchived) {
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

          <table className="details-table">
            <tbody>
              <tr>
                <th><strong>Direction:</strong></th>
                <td>{call.direction}</td>
              </tr>
              <tr>
                <th><strong>From:</strong></th>
                <td>{call.from}</td>
              </tr>
              <tr>
                <th><strong>To:</strong></th>
                <td>{call.to}</td>
              </tr>
              <tr>
                <th><strong>Type:</strong></th>
                <td>{call.call_type}</td>
              </tr>
              <tr>
                <th><strong>Duration:</strong></th>
                <td>{call.duration} seconds</td>
              </tr>
              <tr>
                <th><strong>Date:</strong></th>
                <td>{formattedDate}</td>
              </tr>
              <tr>
                <th><strong>Notes:</strong></th>
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

          <form className="details-note-form" onSubmit={handleAddNote}>
            <label htmlFor="call-note">Add note</label>
            <textarea
              id="call-note"
              value={noteContent}
              placeholder="Write a note for this call..."
              disabled={isBusy}
              onChange={(event) => setNoteContent(event.target.value)}
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
              disabled={isBusy || call.is_archived}
              onClick={handleArchiveCall}
            >
              {isArchiving ? "Archiving..." : call.is_archived ? "Archived" : "Archive call"}
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
    );
}

export default CallDetails;
