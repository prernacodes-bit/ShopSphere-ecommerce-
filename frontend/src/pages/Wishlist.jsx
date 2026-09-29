
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =========================
  // FETCH WISHLIST
  // =========================

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist(response.data.wishlist || []);

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load wishlist"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.delete(
        `/wishlist/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product removed from wishlist"
      );

      await fetchWishlist();

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="wishlist-page">
        <h1>My Wishlist</h1>
        <p>Loading wishlist...</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="wishlist-page">

      <h1>My Wishlist ❤️</h1>

      {message && (
        <p className="wishlist-message">
          {message}
        </p>
      )}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">

          <h2>
            Your wishlist is empty
          </h2>

          <p>
            Add products you love to your wishlist.
          </p>

          <button
            onClick={() => navigate("/")}
          >
            Browse Products
          </button>

        </div>
      ) : (
        <div className="wishlist-list">

          {wishlist.map((item) => (

            <div
              className="wishlist-card"
              key={item.id}
            >

              <img
                src={item.image_url}
                alt={item.name}
                className="wishlist-image"
                onClick={() =>
                  navigate(
                    `/products/${item.product_id}`
                  )
                }
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/600x600/png?text=No+Image";
                }}
              />

              <div className="wishlist-info">

                <h2>
                  {item.name}
                </h2>

                <p>
                  {item.description}
                </p>

                <p className="wishlist-price">
                  ₹{Number(item.price).toFixed(2)}
                </p>

                <p>
                  ⭐ {item.rating}
                </p>

                <p>
                  Stock:{" "}
                  {Number(item.stock) > 0
                    ? item.stock
                    : "Out of stock"}
                </p>

                <div className="wishlist-actions">

                  <button
                    onClick={() =>
                      navigate(
                        `/products/${item.product_id}`
                      )
                    }
                  >
                    View Product
                  </button>

                  <button
                    className="remove-wishlist-btn"
                    onClick={() =>
                      removeFromWishlist(
                        item.product_id
                      )
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Wishlist;

