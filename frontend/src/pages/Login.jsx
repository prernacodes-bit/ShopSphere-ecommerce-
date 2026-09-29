import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", { email, password });

      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
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
              Welcome back to <br />
              modern shopping.
            </h2>

            <p className="auth-brand-subtitle">
              Sign in to continue your journey — track orders, manage
              your wishlist, and enjoy a seamless checkout.
            </p>

            <ul className="auth-features">
              <li>
                <span className="auth-feature-icon">🚀</span>
                Fast &amp; secure checkout
              </li>
              <li>
                <span className="auth-feature-icon">🔒</span>
                100% protected payments
              </li>
              <li>
                <span className="auth-feature-icon">♥</span>
                Save your favourite products
              </li>
              <li>
                <span className="auth-feature-icon">🚚</span>
                Free shipping on eligible orders
              </li>
            </ul>

            <div className="auth-brand-footer">
              <div className="auth-avatars">
                <span>👤</span>
                <span>👤</span>
                <span>👤</span>
              </div>
              <p>
                Joined by <strong>10,000+</strong> happy customers
              </p>
            </div>

          </div>

          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />
        </aside>


        {/* ============ RIGHT: FORM ============ */}
        <main className="auth-form-wrap">

          <div className="auth-form-header">
            <h1>Sign in</h1>
            <p>Enter your details to access your account</p>
          </div>

          {message && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span className="auth-alert-icon">⚠</span>
              <span>{message}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>

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
              <div className="auth-field-head">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth-forgot">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            <label className="auth-checkbox">
              <input type="checkbox" defaultChecked />
              <span className="auth-checkbox-box" />
              <span className="auth-checkbox-label">Keep me signed in</span>
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <span className="auth-submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            New to ShopSphere?{" "}
            <Link to="/register">Create an account</Link>
          </p>

        </main>

      </div>
    </div>
  );
}

export default Login;