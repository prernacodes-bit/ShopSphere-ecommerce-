
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  // =========================
  // FETCH ALL ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await API.get("/orders/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
      setMessage("");
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // VIEW ORDER DETAILS
  // =========================

  const handleViewDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await API.get(
        `/orders/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedOrder(response.data.order);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load order details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const handleStatusChange = async (
    orderId,
    status
  ) => {
    try {
      setUpdatingId(orderId);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await API.put(
        `/orders/admin/${orderId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Order status updated successfully"
      );

      // Refresh orders
      await fetchOrders();

      // Refresh selected order details
      if (
        selectedOrder &&
        Number(selectedOrder.id) === Number(orderId)
      ) {
        await handleViewDetails(orderId);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // =========================
  // GET STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";

      case "Processing":
        return "status-processing";

      case "Shipped":
        return "status-shipped";

      case "Delivered":
        return "status-delivered";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="admin-page">
        <p>Loading orders...</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="admin-page">

      
      {/* =========================
          MESSAGE
      ========================= */}

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}


      {/* =========================
          ORDER DETAILS
      ========================= */}

      {selectedOrder && (

        <div className="admin-order-details">

          {/* DETAILS HEADER */}

          <div className="admin-order-details-header">

            <div>

              <h2>
                Order #{selectedOrder.id}
              </h2>

              <p>
                Customer:{" "}
                {selectedOrder.customer_name}
              </p>

              <p>
                Email:{" "}
                {selectedOrder.customer_email}
              </p>

            </div>

            <button
              className="admin-cancel-btn"
              onClick={() =>
                setSelectedOrder(null)
              }
            >
              Close
            </button>

          </div>


          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <div className="admin-order-summary">

            <p>
              <strong>
                Total:
              </strong>{" "}
              ₹
              {Number(
                selectedOrder.total_amount
              ).toFixed(2)}
            </p>

            <p>
              <strong>
                Current Status:
              </strong>{" "}

              <span
                className={`order-status-badge ${getStatusClass(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>

            </p>

            {/* IMPORTANT:
                created_at is ONLY order creation time
            */}

            <p>
              <strong>
                Order Created:
              </strong>{" "}
              {formatDateTime(
                selectedOrder.created_at
              )}
            </p>

          </div>


          {/* =========================
              STATUS HISTORY
          ========================= */}

          <div className="order-status-history">

            <h3>
              Order Status History
            </h3>

            {selectedOrder.status_history &&
            selectedOrder.status_history.length > 0 ? (

              <div className="status-history-list">

                {selectedOrder.status_history.map(
                  (history, index) => (

                    <div
                      className="status-history-item"
                      key={
                        history.id ||
                        `${history.status}-${index}`
                      }
                    >

                      <div className="status-history-dot">
                        ●
                      </div>

                      <div className="status-history-content">

                        <h4
                          className={`history-status ${getStatusClass(
                            history.status
                          )}`}
                        >
                          {history.status}
                        </h4>

                        <p>
                          {formatDateTime(
                            history.changed_at
                          )}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p>
                No status history available.
              </p>

            )}

          </div>


          {/* =========================
              ORDER ITEMS
          ========================= */}

          <h3>
            Order Items
          </h3>

          <div className="admin-order-items">

            {selectedOrder.items?.map(
              (item) => (

                <div
                  className="admin-order-item"
                  key={item.product_id}
                >

                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/300x300/png?text=No+Image";
                    }}
                  />

                  <div>

                    <h4>
                      {item.product_name}
                    </h4>

                    <p>
                      Quantity:{" "}
                      {item.quantity}
                    </p>

                    <p>
                      Price: ₹
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </p>

                    <p>
                      Subtotal: ₹
                      {Number(
                        item.subtotal
                      ).toFixed(2)}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}


      {/* =========================
          ALL ORDERS
      ========================= */}

      <div className="admin-product-header">

        <h2>
          All Orders
        </h2>

        <button
          className="admin-add-btn"
          onClick={fetchOrders}
        >
          Refresh Orders
        </button>

      </div>


      {orders.length === 0 ? (

        <p>
          No orders found.
        </p>

      ) : (

        <div className="admin-orders-list">

          {orders.map((order) => (

            <div
              className="admin-order-card"
              key={order.id}
            >

              {/* =========================
                  ORDER INFO
              ========================= */}

              <div className="admin-order-info">

                <h3>
                  Order #{order.id}
                </h3>

                <p>
                  Customer:{" "}
                  <strong>
                    {order.customer_name}
                  </strong>
                </p>

                <p>
                  Email:{" "}
                  {order.customer_email}
                </p>

                <p>
                  Total: ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </p>

                {/* ORIGINAL ORDER CREATED TIME */}

                <p>
                  Order Created:{" "}
                  {formatDateTime(
                    order.created_at
                  )}
                </p>

              </div>


              {/* =========================
                  STATUS
              ========================= */}

              <div className="admin-order-status">

                <label>
                  Status
                </label>

                <select
                  value={order.status}
                  disabled={
                    updatingId === order.id
                  }
                  onChange={(e) =>
                    handleStatusChange(
                      order.id,
                      e.target.value
                    )
                  }
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Shipped">
                    Shipped
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

                {updatingId === order.id && (
                  <small>
                    Updating...
                  </small>
                )}

              </div>


              {/* =========================
                  ACTION
              ========================= */}

              <div className="admin-order-actions">

                <button
                  className="admin-edit-btn"
                  onClick={() =>
                    handleViewDetails(
                      order.id
                    )
                  }
                >
                  {detailsLoading
                    ? "Loading..."
                    : "View Details"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminOrders;

