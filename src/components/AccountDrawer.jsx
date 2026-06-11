import { useEffect } from "react";

function AccountDrawer({ isOpen, onClose, onLogout, onToggleTheme, session, theme }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="account-drawer-layer">
      <button
        className="account-drawer-overlay"
        type="button"
        aria-label="Dismiss account settings"
        onClick={onClose}
      />

      <aside
        className="account-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-drawer-title"
      >
        <div className="account-drawer-header">
          <div>
            <p className="account-drawer-kicker">Signed in</p>
            <h2 id="account-drawer-title">{session.name}</h2>
          </div>
          <button
            className="account-drawer-close"
            type="button"
            aria-label="Close account settings"
            onClick={onClose}
          >
            x
          </button>
        </div>

        {session.email && <p className="account-drawer-email">{session.email}</p>}

        <div className="account-drawer-section">
          <h3>Preferences</h3>
          <button
            className="theme-toggle-button drawer-theme-toggle"
            type="button"
            title="Toggle light/dark theme"
            aria-label="Toggle light/dark theme"
            onClick={onToggleTheme}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
            <span className="theme-toggle-label">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
        </div>

        <div className="account-drawer-section">
          <h3>Session</h3>
          <button className="drawer-logout-button" type="button" onClick={() => onLogout()}>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}

export default AccountDrawer;
