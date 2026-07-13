import type { FormEvent } from "react";
import { useState } from "react";
import type { ChangePasswordCredentials } from "../types";
import { getPasswordValidationMessage } from "../utils/authStorage";
import Modal from "./Modal";

interface ChangePasswordDialogProps {
  onCancel: () => void;
  onChangePassword: (credentials: ChangePasswordCredentials) => Promise<void>;
}

function ChangePasswordDialog({ onCancel, onChangePassword }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentPasswordValidationMessage = currentPassword ? "" : "Current password is required.";
  const newPasswordValidationMessage = getPasswordValidationMessage(newPassword);
  const unchangedPasswordMessage =
    currentPassword && newPassword === currentPassword
      ? "New password must be different from the current password."
      : "";
  const confirmationValidationMessage =
    passwordConfirmation !== newPassword ? "Passwords must match." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasInteracted(true);

    if (
      currentPasswordValidationMessage ||
      newPasswordValidationMessage ||
      unchangedPasswordMessage ||
      confirmationValidationMessage
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      await onChangePassword({ currentPassword, newPassword });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <Modal className="password-change-dialog" labelledBy="password-change-title">
      <div className="modal-header">
        <h2 id="password-change-title">Change password</h2>
        <button
          className="close-button"
          type="button"
          aria-label="Close password change"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Close
        </button>
      </div>

      <p className="password-change-copy">
        Enter your current password and choose a new one. You will be signed out everywhere.
      </p>

      {formError && (
        <div className="auth-error" role="alert">
          {formError}
        </div>
      )}

      <form className="auth-form password-change-form" noValidate onSubmit={handleSubmit}>
        <PasswordField
          id="current-password"
          label="Current password"
          value={currentPassword}
          autoComplete="current-password"
          disabled={isSubmitting}
          validationMessage={hasInteracted ? currentPasswordValidationMessage : ""}
          onChange={(value) => {
            setCurrentPassword(value);
            setHasInteracted(true);
            setFormError("");
          }}
        />
        <PasswordField
          id="new-password"
          label="New password"
          value={newPassword}
          autoComplete="new-password"
          disabled={isSubmitting}
          validationMessage={
            hasInteracted ? newPasswordValidationMessage || unchangedPasswordMessage : ""
          }
          onChange={(value) => {
            setNewPassword(value);
            setHasInteracted(true);
            setFormError("");
          }}
        />
        <PasswordField
          id="new-password-confirmation"
          label="Confirm new password"
          value={passwordConfirmation}
          autoComplete="new-password"
          disabled={isSubmitting}
          validationMessage={hasInteracted ? confirmationValidationMessage : ""}
          onChange={(value) => {
            setPasswordConfirmation(value);
            setHasInteracted(true);
            setFormError("");
          }}
        />

        <div className="modal-actions password-change-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Changing password..." : "Change password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface PasswordFieldProps {
  autoComplete: string;
  disabled: boolean;
  id: string;
  label: string;
  onChange: (value: string) => void;
  validationMessage: string;
  value: string;
}

function PasswordField({
  autoComplete,
  disabled,
  id,
  label,
  onChange,
  validationMessage,
  value,
}: PasswordFieldProps) {
  const hasError = validationMessage !== "";

  return (
    <div className={hasError ? "auth-field has-error" : "auth-field"}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        aria-invalid={hasError}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {hasError && (
        <span className="auth-field-guidance is-visible" role="status">
          <span className="auth-field-guidance-text">{validationMessage}</span>
        </span>
      )}
    </div>
  );
}

export default ChangePasswordDialog;
