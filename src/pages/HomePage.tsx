import { Link } from "react-router-dom";
import type { AuthSession, Theme } from "../types";

interface HomePageProps {
  onToggleTheme: () => void;
  session: AuthSession | null;
  theme: Theme;
}

function HomePage({ onToggleTheme, session, theme }: HomePageProps) {
  return (
    <main className="home-page">
      <header className="home-nav">
        <Link className="home-brand" to="/">
          Call Center
        </Link>
        <nav className="home-nav-actions" aria-label="Home navigation">
          {session ? (
            <Link className="home-nav-link" to="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link className="home-nav-link" to="/login">
                Login
              </Link>
              <Link className="home-nav-button" to="/signup">
                Sign up
              </Link>
            </>
          )}
          <button
            className="theme-toggle-button"
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
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Frontend call operations dashboard</p>
          <h1>Call Center Dashboard</h1>
          <p className="home-summary">
            Track active and archived calls, inspect customer conversations, add notes, and keep
            daily call workflows moving from one focused interface.
          </p>
          <div className="home-hero-actions">
            <Link
              className="primary-button home-cta-primary"
              to={session ? "/dashboard" : "/login"}
            >
              {session ? "Open dashboard" : "Login"}
            </Link>
            {!session && (
              <Link className="secondary-button home-cta-secondary" to="/signup">
                Create account
              </Link>
            )}
          </div>
        </div>

        <div className="home-preview" aria-label="Dashboard preview">
          <div className="preview-header">
            <span>Live call feed</span>
            <strong>24 today</strong>
          </div>
          <div className="preview-stats">
            <div>
              <span>Answered</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Missed</span>
              <strong>4</strong>
            </div>
            <div>
              <span>Voicemail</span>
              <strong>2</strong>
            </div>
          </div>
          <div className="preview-call-list">
            <div className="preview-call answered">
              <span>Inbound</span>
              <strong>+1 555-0100</strong>
              <small>2 min ago</small>
            </div>
            <div className="preview-call missed">
              <span>Outbound</span>
              <strong>+1 555-0200</strong>
              <small>12 min ago</small>
            </div>
            <div className="preview-call voicemail">
              <span>Inbound</span>
              <strong>+1 555-0300</strong>
              <small>28 min ago</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features" aria-label="Project highlights">
        <article>
          <h2>API-backed workflows</h2>
          <p>
            Calls load from the backend service and update through clear archive, delete, and note
            actions.
          </p>
        </article>
        <article>
          <h2>Focused review tools</h2>
          <p>
            Filters, search, stats, details, and pagination help agents scan the right calls
            quickly.
          </p>
        </article>
        <article>
          <h2>Backend-ready auth</h2>
          <p>
            The current demo login can be replaced later with real signup and login API endpoints.
          </p>
        </article>
      </section>
    </main>
  );
}

export default HomePage;
