import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users/admin/all");

      setUsers(response.data.users || []);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-header">

        <div>
          <h1>User Management</h1>
          <p>
            View registered ShopSphere users.
          </p>
        </div>

        <div className="admin-navigation">

          <Link to="/admin">
            Dashboard
          </Link>

          <Link to="/admin/products">
            Products
          </Link>

          <Link to="/admin/orders">
            Orders
          </Link>

          <Link to="/admin/users">
            Users
          </Link>

          <Link to="/profile">
            Profile
          </Link>

        </div>

      </div>

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      <div className="admin-users-header">
        <h2>
          All Users ({users.length})
        </h2>
      </div>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="admin-users-list">

          {users.map((user) => (

            <div
              className="admin-user-card"
              key={user.id}
            >

              <div>
                <h3>
                  {user.name}
                </h3>

                <p>
                  <strong>User ID:</strong>{" "}
                  {user.id}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {user.email}
                </p>

                <p>
                  <strong>Role:</strong>{" "}
                  {user.role}
                </p>
              </div>

              <div>
                <span
                  className={
                    user.role === "admin"
                      ? "admin-role"
                      : "user-role"
                  }
                >
                  {user.role}
                </span>
              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default AdminUsers;