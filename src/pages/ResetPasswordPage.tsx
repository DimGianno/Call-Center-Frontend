import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useBackendWakeup from "../hooks/useBackendWakeup";
import type { ResetPasswordCredentials, Theme } from "../types";
import { getPasswordValidationMessage } from "../utils/authStorage";

interface ResetPasswordPageProps {
  onResetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  onToggleTheme: () => void;
  theme: Theme;
}

function ResetPasswordPage({ onResetPassword, onToggleTheme, theme }: ResetPasswordPageProps) {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = searchParams.get("token") ?? "";
  const passwordValidationMessage = getPasswordValidationMessage(password);
  const confirmationValidationMessage =
    passwordConfirmation !== password ? "Passwords must match." : "";
  const showPasswordValidation = hasInteracted && passwordValidationMessage !== "";
  const showConfirmationValidation = hasInteracted && confirmationValidationMessage !== "";
  useBackendWakeup();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasInteracted(true);

    if (!token || passwordValidationMessage || confirmationValidationMessage) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      await onResetPassword({ token, password });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <button
        className="theme-toggle-button auth-theme-toggle"
        type="button"
        title="Toggle light/dark theme"
        aria-label="Toggle light/dark theme"
        onClick={onToggleTheme}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {theme === "light" ? "D" : "L"}
        </span>
        <span className="theme-toggle-label">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
      </button>

      <section className="auth-panel" aria-labelledby="reset-password-title">
        <div className="auth-heading">
          <p className="auth-kicker">Call Center</p>
          <h1 id="reset-password-title">Reset password</h1>
          <p className="auth-heading-copy">Choose a new password for your account.</p>
        </div>

        {!token ? (
          <>
            <div className="auth-error" role="alert">
              This password reset link is missing a token.
            </div>
            <Link className="primary-button auth-submit-button" to="/forgot-password">
              Request a new link
            </Link>
          </>
        ) : (
          <>
            {formError && (
              <div className="auth-error" role="alert">
                {formError}
              </div>
            )}

            <form className="auth-form" noValidate onSubmit={handleSubmit}>
              <div className={showPasswordValidation ? "auth-field has-error" : "auth-field"}>
                <label htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  aria-invalid={showPasswordValidation}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setHasInteracted(true);
                    setFormError("");
                  }}
                />
                {showPasswordValidation && (
                  <span className="auth-field-guidance is-visible" role="status">
                    <span className="auth-field-guidance-text">{passwordValidationMessage}</span>
                  </span>
                )}
              </div>

              <div className={showConfirmationValidation ? "auth-field has-error" : "auth-field"}>
                <label htmlFor="reset-password-confirmation">Confirm new password</label>
                <input
                  id="reset-password-confirmation"
                  type="password"
                  value={passwordConfirmation}
                  aria-invalid={showConfirmationValidation}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setPasswordConfirmation(event.target.value);
                    setHasInteracted(true);
                    setFormError("");
                  }}
                />
                {showConfirmationValidation && (
                  <span className="auth-field-guidance is-visible" role="status">
                    <span className="auth-field-guidance-text">
                      {confirmationValidationMessage}
                    </span>
                  </span>
                )}
              </div>

              <button
                className="primary-button auth-submit-button"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Updating password..." : "Reset password"}
              </button>
            </form>

            <Link className="auth-secondary-link" to="/forgot-password">
              Request a new link
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default ResetPasswordPage;
