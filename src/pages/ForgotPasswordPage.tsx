import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/authApi";
import useBackendWakeup from "../hooks/useBackendWakeup";
import type { Theme } from "../types";
import { getEmailValidationMessage } from "../utils/authStorage";

interface ForgotPasswordPageProps {
  onToggleTheme: () => void;
  theme: Theme;
}

function ForgotPasswordPage({ onToggleTheme, theme }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const emailValidationMessage = getEmailValidationMessage(email);
  const showEmailValidation = hasInteracted && emailValidationMessage !== "";
  useBackendWakeup();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasInteracted(true);

    const normalizedEmail = email.trim();
    const validationMessage = getEmailValidationMessage(normalizedEmail);

    if (validationMessage) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      setEmail(normalizedEmail);
      await requestPasswordReset(normalizedEmail);
      setIsSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
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

      <section className="auth-panel" aria-labelledby="forgot-password-title">
        <div className="auth-heading">
          <p className="auth-kicker">Call Center</p>
          <h1 id="forgot-password-title">Forgot password?</h1>
          <p className="auth-heading-copy">
            Enter your account email and we will send a secure password reset link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="auth-message" role="status">
            If an account exists for this email, a password reset link will be sent shortly.
          </div>
        ) : (
          <>
            {formError && (
              <div className="auth-error" role="alert">
                {formError}
              </div>
            )}

            <form className="auth-form" noValidate onSubmit={handleSubmit}>
              <div className={showEmailValidation ? "auth-field has-error" : "auth-field"}>
                <label htmlFor="forgot-password-email">Email</label>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  aria-describedby={
                    showEmailValidation ? "forgot-password-email-guidance" : undefined
                  }
                  aria-invalid={showEmailValidation}
                  autoComplete="email"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setHasInteracted(true);
                    setFormError("");
                  }}
                />
                <span
                  id="forgot-password-email-guidance"
                  className={
                    showEmailValidation ? "auth-field-guidance is-visible" : "auth-field-guidance"
                  }
                  aria-hidden={!showEmailValidation}
                  aria-live="polite"
                >
                  <span className="auth-field-guidance-text">{emailValidationMessage}</span>
                </span>
              </div>

              <button
                className="primary-button auth-submit-button"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Sending reset link..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <Link className="auth-secondary-link" to="/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
