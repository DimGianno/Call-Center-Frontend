import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { AuthMode, LoginCredentials, SignupCredentials, Theme } from "../types";
import {
  getEmailValidationMessage,
  getPasswordValidationMessage,
  validateAuthForm,
} from "../utils/authStorage";

const AUTH_MODES = {
  login: "login",
  signup: "signup",
} as const;

interface AuthScreenProps {
  mode?: AuthMode;
  notice: string;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onModeChange?: (nextMode: AuthMode) => void;
  onSignup: (credentials: SignupCredentials) => Promise<void>;
  onToggleTheme: () => void;
  theme: Theme;
}

function AuthScreen({
  mode = AUTH_MODES.login,
  notice,
  onLogin,
  onModeChange,
  onSignup,
  onToggleTheme,
  theme,
}: AuthScreenProps) {
  const [authMode, setAuthMode] = useState(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [hasInteractedWithEmail, setHasInteractedWithEmail] = useState(false);
  const [hasInteractedWithPassword, setHasInteractedWithPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = authMode === AUTH_MODES.signup;
  const emailValidationMessage = getEmailValidationMessage(email);
  const passwordValidationMessage = getPasswordValidationMessage(password);
  const showEmailValidation = hasInteractedWithEmail && emailValidationMessage !== "";
  const showPasswordValidation = hasInteractedWithPassword && passwordValidationMessage !== "";

  useEffect(() => {
    setAuthMode(mode);
    setFormError("");
  }, [mode]);

  function handleModeChange(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setFormError("");

    if (onModeChange) {
      onModeChange(nextMode);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasInteractedWithEmail(true);
    setHasInteractedWithPassword(true);

    const normalizedEmail = email.trim();

    const validationMessage = validateAuthForm({
      name,
      email: normalizedEmail,
      password,
      isSignup,
    });

    if (validationMessage) {
      const isFieldValidationMessage =
        validationMessage === emailValidationMessage ||
        validationMessage === passwordValidationMessage;
      setFormError(isFieldValidationMessage ? "" : validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      setEmail(normalizedEmail);

      if (isSignup) {
        await onSignup({ name, email: normalizedEmail, password });
      } else {
        await onLogin({ email: normalizedEmail, password });
      }
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
          {theme === "light" ? "🌙" : "☀️"}
        </span>
        <span className="theme-toggle-label">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
      </button>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-heading">
          <p className="auth-kicker">Call Center</p>
          <h1 id="auth-title">Dashboard Access</h1>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            className={authMode === AUTH_MODES.login ? "auth-tab is-active" : "auth-tab"}
            type="button"
            role="tab"
            aria-selected={authMode === AUTH_MODES.login}
            disabled={isSubmitting}
            onClick={() => handleModeChange(AUTH_MODES.login)}
          >
            Login
          </button>
          <button
            className={authMode === AUTH_MODES.signup ? "auth-tab is-active" : "auth-tab"}
            type="button"
            role="tab"
            aria-selected={authMode === AUTH_MODES.signup}
            disabled={isSubmitting}
            onClick={() => handleModeChange(AUTH_MODES.signup)}
          >
            Sign up
          </button>
        </div>

        {notice && (
          <div className="auth-message" role="status">
            {notice}
          </div>
        )}

        {formError && (
          <div className="auth-error" role="alert">
            {formError}
          </div>
        )}

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field" htmlFor="auth-name">
              <span>Name</span>
              <input
                id="auth-name"
                type="text"
                value={name}
                autoComplete="name"
                disabled={isSubmitting}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}

          <label
            className={showEmailValidation ? "auth-field has-error" : "auth-field"}
            htmlFor="auth-email"
          >
            <span>Email</span>
            <input
              id="auth-email"
              type="email"
              value={email}
              aria-describedby={showEmailValidation ? "auth-email-guidance" : undefined}
              aria-invalid={showEmailValidation}
              autoComplete="email"
              disabled={isSubmitting}
              onChange={(event) => {
                setEmail(event.target.value);
                setHasInteractedWithEmail(true);
                setFormError("");
              }}
            />
            <span
              id="auth-email-guidance"
              className="auth-field-guidance"
              aria-atomic="true"
              aria-live="polite"
            >
              {showEmailValidation ? emailValidationMessage : ""}
            </span>
          </label>

          <label
            className={showPasswordValidation ? "auth-field has-error" : "auth-field"}
            htmlFor="auth-password"
          >
            <span>Password</span>
            <input
              id="auth-password"
              type="password"
              value={password}
              aria-describedby={showPasswordValidation ? "auth-password-guidance" : undefined}
              aria-invalid={showPasswordValidation}
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={isSubmitting}
              onChange={(event) => {
                setPassword(event.target.value);
                setHasInteractedWithPassword(true);
                setFormError("");
              }}
            />
            <span
              id="auth-password-guidance"
              className="auth-field-guidance"
              aria-atomic="true"
              aria-live="polite"
            >
              {showPasswordValidation ? passwordValidationMessage : ""}
            </span>
          </label>

          <button
            className="primary-button auth-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Working..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthScreen;
