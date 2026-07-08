import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmailToken } from "../api/authApi";
import type { Theme } from "../types";

interface VerifyEmailPageProps {
  onToggleTheme: () => void;
  theme: Theme;
}

type VerificationState = "verifying" | "success" | "error";

function VerifyEmailPage({ onToggleTheme, theme }: VerifyEmailPageProps) {
  const [searchParams] = useSearchParams();
  const [verificationState, setVerificationState] = useState<VerificationState>("verifying");
  const [message, setMessage] = useState("Verifying your email address...");
  const token = searchParams.get("token") ?? "";

  useEffect(() => {
    let isMounted = true;

    async function verifyToken() {
      if (!token) {
        setVerificationState("error");
        setMessage("This verification link is missing a token.");
        return;
      }

      try {
        await verifyEmailToken(token);

        if (!isMounted) {
          return;
        }

        setVerificationState("success");
        setMessage("Your email has been verified. You can continue using the dashboard.");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setVerificationState("error");
        setMessage(
          error instanceof Error ? error.message : "This verification link is invalid or expired.",
        );
      }
    }

    void verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

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

      <section className="auth-panel" aria-labelledby="verify-email-title">
        <div className="auth-heading">
          <p className="auth-kicker">Call Center</p>
          <h1 id="verify-email-title">Email Verification</h1>
        </div>

        <div
          className={verificationState === "error" ? "auth-error" : "auth-message"}
          role={verificationState === "error" ? "alert" : "status"}
        >
          {message}
        </div>

        {verificationState !== "verifying" && (
          <Link className="primary-button auth-submit-button" to="/login">
            Go to login
          </Link>
        )}
      </section>
    </main>
  );
}

export default VerifyEmailPage;
