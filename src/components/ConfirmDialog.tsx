import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  isDanger?: boolean;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isDanger,
  isProcessing,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      className="confirm-dialog"
      labelledBy="confirm-dialog-title"
      overlayClassName="confirm-modal-overlay"
    >
      <div className="modal-header">
        <h2 id="confirm-dialog-title">{title}</h2>
        <button
          className="close-button"
          type="button"
          title="Cancel"
          aria-label="Cancel"
          disabled={isProcessing}
          onClick={onCancel}
        >
          Close
        </button>
      </div>

      <p className="confirm-message">{message}</p>

      <div className="modal-actions confirm-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={isProcessing}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className={isDanger ? "danger-button" : "primary-button"}
          type="button"
          disabled={isProcessing}
          onClick={onConfirm}
        >
          {isProcessing ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
