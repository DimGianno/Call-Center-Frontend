import type { ToastType } from "../types";

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
}

function Toast({ message, type = "success", onDismiss }: ToastProps) {
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <p className="toast-message">{message}</p>
      <button
        type="button"
        className="toast-dismiss"
        title="Dismiss notification"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        Close
      </button>
    </div>
  );
}

export default Toast;
