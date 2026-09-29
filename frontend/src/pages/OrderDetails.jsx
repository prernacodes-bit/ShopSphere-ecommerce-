import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get(`/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrder(response.data.order);
      } catch (error) {
        console.error(error);

        setMessage(
          error.response?.data?.message ||
            "Failed to load order details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  if (!order) {
    return <p>Order not found</p>;
  }

  return (
    <div className="order-details-page">

      <button onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      <h1>Order #{order.id}</h1>

      <p>
        Status: <strong>{order.status}</strong>
      </p>

      <p>
        Date:{" "}
        {new Date(order.created_at).toLocaleString()}
      </p>

      <h2>Order Items</h2>

      <div className="order-items">
        {order.items.map((item) => (
          <div
            className="order-item"
            key={item.product_id}
          >

            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.product_name}
                className="order-item-image"
              />
            )}

            <div>
              <h3>{item.product_name}</h3>

              <p>
                Price: ₹
                {Number(item.price).toFixed(2)}
              </p>

              <p>
                Quantity: {item.quantity}
              </p>

              <p>
                Subtotal: ₹
                {Number(item.subtotal).toFixed(2)}
              </p>
            </div>

          </div>
        ))}
      </div>

      <div className="order-total">
        <h2>
          Total: ₹
          {Number(order.total_amount).toFixed(2)}
        </h2>
      </div>

    </div>
  );
}

export default OrderDetails;