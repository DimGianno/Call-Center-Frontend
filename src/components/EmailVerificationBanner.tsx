import { useState } from "react";
import { resendVerificationEmail } from "../api/authApi";
import type { EmailVerificationStatus, ShowToast } from "../types";

interface EmailVerificationBannerProps {
  email: string;
  emailVerification: EmailVerificationStatus;
  showToast: ShowToast;
}

function formatDeadline(requiredAt: string | null) {
  if (!requiredAt) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(requiredAt));
}

function EmailVerificationBanner({
  email,
  emailVerification,
  showToast,
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);

  if (emailVerification.verified) {
    return null;
  }

  const deadline = formatDeadline(emailVerification.requiredAt);

  async function handleResendVerification() {
    setIsResending(true);

    try {
      await resendVerificationEmail();
      showToast("Verification email sent. Check your inbox.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to resend verification email.",
        "error",
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <section className="email-verification-banner" aria-label="Email verification notice">
      <div>
        <strong>Verify your email address</strong>
        <p>
          We sent a verification link to {email}.
          {deadline ? ` Please verify before ${deadline}.` : ""}
        </p>
      </div>
      <button
        className="secondary-button"
        type="button"
        disabled={isResending}
        onClick={handleResendVerification}
      >
        {isResending ? "Sending..." : "Resend email"}
      </button>
    </section>
  );
}

export default EmailVerificationBanner;
