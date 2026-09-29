import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const stock = Number(product.stock);
  const price = Number(product.price);

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = async () => {
    setMessage("");

    if (stock <= 0) {
      setMessage("Product is out of stock");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/cart",
        {
          product_id: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product added to cart successfully"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD TO WISHLIST
  // =========================

  const handleWishlist = async () => {
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);

      const response = await API.post(
        "/wishlist",
        {
          product_id: product.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product added to wishlist successfully"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to add product to wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // =========================
  // PRODUCT DETAILS
  // =========================

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="product-card">

      {/* PRODUCT IMAGE */}

      <img
        src={product.image_url}
        alt={product.name}
        onClick={handleProductClick}
        className="product-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://placehold.co/600x600/png?text=No+Image";
        }}
      />

      {/* PRODUCT NAME */}

      <h3
        onClick={handleProductClick}
        className="product-title"
      >
        {product.name}
      </h3>

      {/* DESCRIPTION */}

      <p className="description">
        {product.description}
      </p>

      {/* PRICE */}

      <p className="price">
        ₹{price.toFixed(2)}
      </p>

      {/* RATING */}

      <p className="rating">
        ⭐ {product.rating}
      </p>

      {/* STOCK */}

      <p>
        Stock:{" "}
        {stock > 0
          ? stock
          : "Out of stock"}
      </p>

      {/* CATEGORY */}

      <p>
        Category: {product.category_name}
      </p>

      {/* WISHLIST */}

      <button
        type="button"
        className="wishlist-btn"
        onClick={handleWishlist}
        disabled={wishlistLoading}
      >
        {wishlistLoading
          ? "Adding..."
          : "♡ Add to Wishlist"}
      </button>

      {/* ADD TO CART */}

      <button
        type="button"
        className="add-cart"
        onClick={handleAddToCart}
        disabled={loading || stock <= 0}
      >
        {stock <= 0
          ? "Out of Stock"
          : loading
          ? "Adding..."
          : "Add to Cart"}
      </button>

      {/* MESSAGE */}

      {message && (
        <p className="product-message">
          {message}
        </p>
      )}

    </div>
  );
}

export default ProductCard;