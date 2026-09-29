import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        ShopSphere
      </Link>

      <div className="nav-links">

        {/* Common */}
        <Link to="/">
          Products
        </Link>

        {token && (
          <>
            {/* Normal User */}
            {!isAdmin && (
              <>
                <Link to="/cart">
                  Cart
                </Link>

                <Link to="/orders">
                  My Orders
                </Link>

                <Link
                  to="/wishlist"
                  className={
                    location.pathname === "/wishlist"
                      ? "active-link"
                      : ""
                  }
                >
                  Wishlist
                </Link>
              </>
            )}

            {/* Admin */}
            {isAdmin && (
              <>
                <Link to="/admin">
                  Admin Dashboard
                </Link>

                <Link to="/admin/products">
                  Product Management
                </Link>
                <Link to="/admin/deals">
    🏷️ Deals
</Link>
                <Link to="/admin/orders">
                  Order Management
                </Link>
              </>
            )}

            {/* Profile — Logout cha LEFT la */}
            <Link
              to="/profile"
              className={
                location.pathname === "/profile"
                  ? "active-link"
                  : ""
              }
            >
              Profile
            </Link>

            {/* Logout — सर्वात शेवटी */}
            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {/* Not Logged In */}
        {!token && (
          <Link to="/login">
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;