import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [filter, setFilter] = useState("All");

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.get("/orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to load orders"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // STATUS CONFIG
  // =========================
  const getStatusConfig = (status) => {
    const map = {
      Pending: { color: "warning", icon: "⏳" },
      Processing: { color: "info", icon: "⚙️" },
      Shipped: { color: "primary", icon: "🚚" },
      Delivered: { color: "success", icon: "✓" },
      Cancelled: { color: "danger", icon: "✕" },
    };
    return map[status] || { color: "default", icon: "📦" };
  };

  // =========================
  // STATS
  // =========================
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    spent: orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  };

  // =========================
  // FILTER TABS
  // =========================
  const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading your orders…</p>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div className="orders-page">

      {/* ============ HEADER ============ */}
      <div className="orders-header">
        <div>
          <h1>My Orders</h1>
          <p className="orders-subtitle">
            {orders.length === 0
              ? "Track your orders here"
              : `You have ${orders.length} order${orders.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <button
          className="orders-shop-btn"
          onClick={() => navigate("/")}
        >
          Continue Shopping →
        </button>
      </div>

      {/* ============ MESSAGE ============ */}
      {message && (
        <div
          className={
            messageType === "success"
              ? "orders-message orders-message-success"
              : "orders-message orders-message-error"
          }
        >
          <span>{messageType === "success" ? "✓" : "⚠"}</span>
          {message}
        </div>
      )}

      {/* ============ EMPTY ORDERS ============ */}
      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start shopping and your orders will appear here.</p>

          <button
            className="empty-orders-btn"
            onClick={() => navigate("/")}
          >
            Start Shopping →
          </button>
        </div>
      ) : (
        <>

          {/* ============ STATS ============ */}
          <div className="orders-stats">
            <div className="orders-stat-card">
              <span className="orders-stat-icon">📦</span>
              <div>
                <span className="orders-stat-label">Total Orders</span>
                <span className="orders-stat-value">{stats.total}</span>
              </div>
            </div>

            <div className="orders-stat-card">
              <span className="orders-stat-icon">⏳</span>
              <div>
                <span className="orders-stat-label">Pending</span>
                <span className="orders-stat-value">{stats.pending}</span>
              </div>
            </div>

            <div className="orders-stat-card">
              <span className="orders-stat-icon">✓</span>
              <div>
                <span className="orders-stat-label">Delivered</span>
                <span className="orders-stat-value">{stats.delivered}</span>
              </div>
            </div>

            <div className="orders-stat-card">
              <span className="orders-stat-icon">💰</span>
              <div>
                <span className="orders-stat-label">Total Spent</span>
                <span className="orders-stat-value">
                  ₹{stats.spent.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* ============ FILTER TABS ============ */}
          <div className="orders-tabs">
            {tabs.map((tab) => {
              const count =
                tab === "All"
                  ? orders.length
                  : orders.filter((o) => o.status === tab).length;

              // Don't show tab if count is 0 (except All)
              if (tab !== "All" && count === 0) return null;

              return (
                <button
                  key={tab}
                  className={
                    filter === tab
                      ? "orders-tab orders-tab-active"
                      : "orders-tab"
                  }
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                  <span className="orders-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* ============ ORDERS LIST ============ */}
          {filteredOrders.length === 0 ? (
            <div className="orders-filter-empty">
              <span>🔍</span>
              <p>No orders with status "{filter}"</p>
              <button onClick={() => setFilter("All")}>
                Show All Orders
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const date = new Date(order.created_at);

                return (
                  <div className="order-card" key={order.id}>

                    {/* LEFT: ICON */}
                    <div
                      className={`order-icon order-icon-${statusConfig.color}`}
                    >
                      <span>{statusConfig.icon}</span>
                    </div>

                    {/* MIDDLE: INFO */}
                    <div className="order-info">

                      <div className="order-top">
                        <h2 className="order-id">
                          Order #{order.id}
                        </h2>

                        <span
                          className={`order-status order-status-${statusConfig.color}`}
                        >
                          {statusConfig.icon} {order.status}
                        </span>
                      </div>

                      <div className="order-meta">
                        <span className="order-meta-item">
                          📅{" "}
                          {date.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <span className="order-meta-item">
                          🕐{" "}
                          {date.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                    </div>

                    {/* RIGHT: TOTAL + ACTION */}
                    <div className="order-right">

                      <div className="order-amount">
                        <span className="order-amount-label">Total</span>
                        <span className="order-amount-value">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>

                      <button
                        className="order-view-btn"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details →
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </>
      )}

    </div>
  );
}

export default Orders;