import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =========================
  // FETCH CART
  // =========================
  const fetchCart = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.get("/cart");
      setCart(response.data.cart || []);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to load cart"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // =========================
  // UPDATE QUANTITY
  // =========================
  const updateQuantity = async (cartId, quantity, stock) => {
    setMessage("");

    if (quantity < 1) return;

    if (quantity > Number(stock)) {
      setMessage(`Only ${stock} items available in stock`);
      setMessageType("error");
      return;
    }

    try {
      setActionLoading(true);

      const response = await API.put(`/cart/${cartId}`, { quantity });

      setMessage(response.data.message || "Quantity updated");
      setMessageType("success");

      await fetchCart();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to update quantity"
      );
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // REMOVE FROM CART
  // =========================
  const removeFromCart = async (cartId) => {
    setMessage("");

    try {
      setActionLoading(true);

      const response = await API.delete(`/cart/${cartId}`);

      setMessage(response.data.message || "Product removed from cart");
      setMessageType("success");

      await fetchCart();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to remove product"
      );
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // CHECKOUT
  // =========================
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage("Your cart is empty");
      setMessageType("error");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      const response = await API.post("/orders", {});

      setMessage(
        `Order placed successfully! Order ID: #${response.data.orderId}`
      );
      setMessageType("success");

      await fetchCart();

      // Redirect to orders after 1.5s
      setTimeout(() => navigate("/orders"), 1500);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to place order"
      );
      setMessageType("error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // TOTAL
  // =========================
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const shipping = subtotal > 999 ? 0 : subtotal > 0 ? 49 : 0;
  const total = subtotal + shipping;
  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="cart-spinner" />
          <p>Loading your cart…</p>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div className="cart-page">

      {/* ============ HEADER ============ */}
      <div className="cart-header">
        <div>
          <h1>My Cart</h1>
          <p className="cart-subtitle">
            {cart.length === 0
              ? "Your cart is waiting to be filled"
              : `${totalItems} item${totalItems > 1 ? "s" : ""} in your cart`}
          </p>
        </div>

        {cart.length > 0 && (
          <button
            className="cart-continue-btn"
            onClick={() => navigate("/")}
          >
            ← Continue Shopping
          </button>
        )}
      </div>

      {/* ============ MESSAGE ============ */}
      {message && (
        <div
          className={
            messageType === "success"
              ? "cart-message cart-message-success"
              : "cart-message cart-message-error"
          }
        >
          <span>{messageType === "success" ? "✓" : "⚠"}</span>
          {message}
        </div>
      )}

      {/* ============ EMPTY CART ============ */}
      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>

          <button
            className="empty-cart-btn"
            onClick={() => navigate("/")}
          >
            Start Shopping →
          </button>
        </div>
      ) : (

        <div className="cart-layout">

          {/* ============ LEFT: CART ITEMS ============ */}
          <div className="cart-items">

            {cart.map((item) => {
              const quantity = Number(item.quantity);
              const stock = Number(item.stock);
              const price = Number(item.price);
              const itemSubtotal = price * quantity;
              const isMaxStock = quantity >= stock && stock > 0;
              const isOutOfStock = stock <= 0;

              return (
                <div className="cart-item" key={item.id}>

                  {/* PRODUCT IMAGE */}
                  <div className="cart-item-image-wrap">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/300x300/png?text=No+Image";
                      }}
                    />

                    {isOutOfStock && (
                      <span className="cart-item-badge badge-danger">
                        Out of stock
                      </span>
                    )}

                    {isMaxStock && !isOutOfStock && (
                      <span className="cart-item-badge badge-warning">
                        Max
                      </span>
                    )}
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="cart-item-info">

                    <div className="cart-item-top">
                      <h3 className="cart-item-title">
                        {item.product_name}
                      </h3>

                      {item.category_name && (
                        <span className="cart-item-category">
                          {item.category_name}
                        </span>
                      )}
                    </div>

                    <div className="cart-item-price">
                      ₹{price.toFixed(2)}
                    </div>

                    {/* STOCK INFO */}
                    <div className="cart-item-stock">
                      {isOutOfStock ? (
                        <span className="stock-out">Out of stock</span>
                      ) : (
                        <span className="stock-in">
                          ✓ In stock ({stock} available)
                        </span>
                      )}
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="cart-item-actions">

                      <div className="quantity-selector">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, quantity - 1, stock)
                          }
                          disabled={actionLoading || quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, quantity + 1, stock)
                          }
                          disabled={
                            actionLoading || isMaxStock || isOutOfStock
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        disabled={actionLoading}
                        aria-label="Remove item"
                      >
                        🗑 Remove
                      </button>

                    </div>

                  </div>

                  {/* SUBTOTAL */}
                  <div className="cart-item-subtotal">
                    <span className="subtotal-label">Subtotal</span>
                    <span className="subtotal-value">
                      ₹{itemSubtotal.toFixed(2)}
                    </span>
                  </div>

                </div>
              );
            })}

          </div>

          {/* ============ RIGHT: SUMMARY ============ */}
          <aside className="cart-summary">

            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="free-shipping">FREE</span>
                  ) : (
                    `₹${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {shipping > 0 && (
                <div className="cart-shipping-note">
                  💡 Add ₹{(999 - subtotal).toFixed(0)} more for FREE shipping
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

            </div>

            <button
              className="cart-checkout-btn"
              onClick={handleCheckout}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="cart-btn-spinner" />
                  Processing…
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <span className="checkout-arrow">→</span>
                </>
              )}
            </button>

            <div className="cart-trust">
              <div className="trust-badge">🔒 Secure checkout</div>
              <div className="trust-badge">↩️ 7-day returns</div>
              <div className="trust-badge">🚚 Fast delivery</div>
            </div>

          </aside>

        </div>
      )}

    </div>
  );
}

export default Cart;