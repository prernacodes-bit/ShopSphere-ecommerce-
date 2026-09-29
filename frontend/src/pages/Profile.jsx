import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Invalid user data:", error);
    localStorage.removeItem("user");
  }

  // ---- No user: login prompt ----
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <div className="profile-empty-icon">👤</div>
          <h2>You're not signed in</h2>
          <p>Please login to view your profile details.</p>
          <button
            className="profile-login-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ---- Get initials for avatar ----
  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ---- Handle logout ----
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="profile-page">

      {/* ============ HEADER CARD ============ */}
      <div className="profile-hero">

        <div className="profile-avatar">
          <span>{initials}</span>
        </div>

        <div className="profile-hero-info">
          <h1>{user.name || "User"}</h1>
          <p>{user.email || "No email"}</p>

          <span
            className={
              user.role === "admin"
                ? "profile-role-badge admin"
                : "profile-role-badge user"
            }
          >
            {user.role === "admin" ? "👑 Admin" : "👤 Customer"}
          </span>
        </div>

      </div>


      {/* ============ INFO CARD ============ */}
      <div className="profile-card">

        <h2 className="profile-card-title">
          Account Information
        </h2>

        <div className="profile-info-grid">

          <div className="profile-info-item">
            <span className="profile-info-icon">👤</span>
            <div>
              <span className="profile-info-label">Full Name</span>
              <span className="profile-info-value">
                {user.name || "Not set"}
              </span>
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-icon">✉</span>
            <div>
              <span className="profile-info-label">Email Address</span>
              <span className="profile-info-value">
                {user.email || "Not set"}
              </span>
            </div>
          </div>

          <div className="profile-info-item">
            <span className="profile-info-icon">🔑</span>
            <div>
              <span className="profile-info-label">Account Type</span>
              <span className="profile-info-value">
                {user.role === "admin" ? "Administrator" : "Regular User"}
              </span>
            </div>
          </div>

          {/*<div className="profile-info-item">
            <span className="profile-info-icon">🆔</span>
            <div>
              <span className="profile-info-label">User ID</span>
              <span className="profile-info-value">
                #{user.id || "—"}
              </span>
            </div>
          </div>*/}

        </div>

      </div>


      {/* ============ ACTIONS ============ */}
      <div className="profile-actions">

        <button
          className="profile-btn profile-btn-secondary"
          onClick={() => navigate("/orders")}
        >
          📦 My Orders
        </button>

        <button
          className="profile-btn profile-btn-secondary"
          onClick={() => navigate("/wishlist")}
        >
          ♥ Wishlist
        </button>

        <button
          className="profile-btn profile-btn-danger"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;