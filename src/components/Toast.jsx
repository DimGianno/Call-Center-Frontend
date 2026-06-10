function Toast({ message, type = "success", onDismiss }) {
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      <p>{message}</p>
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
