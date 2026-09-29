import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Password strength ----
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const map = [
      { label: "", color: "" },
      { label: "Very weak", color: "#ef4444" },
      { label: "Weak", color: "#f97316" },
      { label: "Fair", color: "#f59e0b" },
      { label: "Good", color: "#10b981" },
      { label: "Strong", color: "#059669" },
    ];

    return { score, ...map[score] };
  }, [password]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setMessage("Please accept the Terms & Conditions");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      setMessage(response.data.message || "Registration successful");
      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1400);

    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">

        {/* ============ LEFT: BRAND PANEL ============ */}
        <aside className="auth-brand">
          <div className="auth-brand-content">

            <Link to="/" className="auth-brand-logo">
              ◆ ShopSphere
            </Link>

            <h2 className="auth-brand-title">
              Join the future <br />
              of shopping.
            </h2>

            <p className="auth-brand-subtitle">
              Create your free account and unlock exclusive deals,
              fast checkout, and personalised recommendations.
            </p>

            <ul className="auth-features">
              <li>
                <span className="auth-feature-icon">🎁</span>
                Exclusive member-only offers
              </li>
              <li>
                <span className="auth-feature-icon">⚡</span>
                One-click checkout experience
              </li>
              <li>
                <span className="auth-feature-icon">♥</span>
                Sync your wishlist across devices
              </li>
              <li>
                <span className="auth-feature-icon">🚚</span>
                Track every order in real-time
              </li>
            </ul>

            <div className="auth-brand-footer">
              <div className="auth-avatars">
                <span>👤</span>
                <span>👤</span>
                <span>👤</span>
              </div>
              <p>
                Trusted by <strong>10,000+</strong> shoppers
              </p>
            </div>

          </div>

          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />
        </aside>


        {/* ============ RIGHT: FORM ============ */}
        <main className="auth-form-wrap">

          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>It's free — takes less than a minute.</p>
          </div>

          {message && (
            <div
              className={
                success
                  ? "auth-alert auth-alert-success"
                  : "auth-alert auth-alert-error"
              }
              role="alert"
            >
              <span className="auth-alert-icon">{success ? "✓" : "⚠"}</span>
              <span>{message}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleRegister}>

            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {password && (
                <div className="auth-strength">
                  <div className="auth-strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={
                          i <= passwordStrength.score
                            ? "auth-strength-bar active"
                            : "auth-strength-bar"
                        }
                        style={{
                          background:
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="auth-strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirm">Confirm password</label>
              <div
                className={
                  confirmPassword
                    ? passwordsMatch
                      ? "auth-input-wrap auth-match"
                      : "auth-input-wrap auth-mismatch"
                    : "auth-input-wrap"
                }
              >
                <span className="auth-input-icon">
                  {confirmPassword ? (passwordsMatch ? "✓" : "✕") : "🔒"}
                </span>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>

              {confirmPassword && (
                <span
                  className={
                    passwordsMatch ? "auth-match-text ok" : "auth-match-text bad"
                  }
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </span>
              )}
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="auth-checkbox-box" />
              <span className="auth-checkbox-label">
                I agree to the{" "}
                <Link to="/terms" className="auth-inline-link">Terms</Link>{" "}
                &amp;{" "}
                <Link to="/privacy" className="auth-inline-link">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <span className="auth-submit-arrow">→</span>
                </>
              )}
            </button>

           

           
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </main>

      </div>
    </div>
  );
}

export default Register;