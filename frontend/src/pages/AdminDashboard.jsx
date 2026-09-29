
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function AdminDashboard() {
  const defaultStats = {
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    lowStockProducts: 0,
  };

  const defaultSales = {
    total_sales: 0,
    total_orders: 0,
    pending_orders: 0,
    processing_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
  };

  const [stats, setStats] = useState(defaultStats);
  const [sales, setSales] = useState(defaultSales);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage("");

      const [dashboardResponse, salesResponse] =
        await Promise.all([
          API.get("/admin/dashboard", {
            headers,
          }),

          API.get("/orders/admin/dashboard", {
            headers,
          }),
        ]);

      // ==========================================
      // STORE OVERVIEW
      // ==========================================

      setStats(
        dashboardResponse.data.stats || defaultStats
      );

      // ==========================================
      // SALES DASHBOARD
      // ==========================================

      setSales(
        salesResponse.data.dashboard || defaultSales
      );

    } catch (error) {
      console.error("Dashboard error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {
    fetchDashboard();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchDashboard]);

  // ==========================================
  // REFRESH WHEN TAB BECOMES ACTIVE
  // ==========================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboard(true);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchDashboard]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

     

      {/* ======================================
          MESSAGE
      ====================================== */}

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      {/* ======================================
          STORE OVERVIEW
      ====================================== */}

      <div className="admin-section-header">

        <div>
          <h2>Store Overview</h2>

          <p>
            Current store statistics
          </p>
        </div>

        {refreshing && (
          <span className="dashboard-refreshing">
            Updating...
          </span>
        )}

      </div>

      <div className="admin-stats">

        <div className="admin-stat-card">
          <h3>Total Products</h3>

          <p>
            {Number(stats.totalProducts || 0)}
          </p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Users</h3>

          <p>
            {Number(stats.totalUsers || 0)}
          </p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Orders</h3>

          <p>
            {Number(stats.totalOrders || 0)}
          </p>
        </div>

        <div className="admin-stat-card low-stock">
          <h3>Low Stock</h3>

          <p>
            {Number(stats.lowStockProducts || 0)}
          </p>
        </div>

      </div>

      {/* ======================================
          SALES DASHBOARD
      ====================================== */}

      <div className="admin-section-header sales-header">

        <div>
          <h2>Sales Dashboard</h2>

          <p>
            Live order and sales statistics
          </p>
        </div>

      </div>

      <div className="admin-stats">

        {/* TOTAL SALES */}

        <div className="admin-stat-card sales-card">
          <h3>Total Sales</h3>

          <p>
            ₹
            {Number(
              sales.total_sales || 0
            ).toFixed(2)}
          </p>
        </div>

        {/* TOTAL ORDERS */}

        <div className="admin-stat-card">
          <h3>Total Orders</h3>

          <p>
            {Number(
              sales.total_orders || 0
            )}
          </p>
        </div>

        {/* PENDING */}

        <div className="admin-stat-card">
          <h3>Pending</h3>

          <p>
            {Number(
              sales.pending_orders || 0
            )}
          </p>
        </div>

        {/* PROCESSING */}

        <div className="admin-stat-card">
          <h3>Processing</h3>

          <p>
            {Number(
              sales.processing_orders || 0
            )}
          </p>
        </div>

        {/* SHIPPED */}

        <div className="admin-stat-card">
          <h3>Shipped</h3>

          <p>
            {Number(
              sales.shipped_orders || 0
            )}
          </p>
        </div>

        {/* DELIVERED */}

        <div className="admin-stat-card">
          <h3>Delivered</h3>

          <p>
            {Number(
              sales.delivered_orders || 0
            )}
          </p>
        </div>

        {/* CANCELLED */}

        <div className="admin-stat-card">
          <h3>Cancelled</h3>

          <p>
            {Number(
              sales.cancelled_orders || 0
            )}
          </p>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;

