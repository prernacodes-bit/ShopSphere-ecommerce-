
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        console.error(error);

        setMessage(
          error.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* =====================================================
     DEAL TYPE
  ===================================================== */

  const normalizeDealType = (value) => {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");
  };

  const getDealType = () => {
    if (!product) {
      return "none";
    }

    return normalizeDealType(
      product.deal_type ||
        product.dealType ||
        product.deal
    );
  };

  const isCurrentDeal = () => {
    const type = getDealType();

    return (
      type === "current" ||
      type === "current_deal" ||
      type === "current_offer" ||
      type === "deal" ||
      type === "offer"
    );
  };

  const isFeaturedDeal = () => {
    const type = getDealType();

    return (
      type === "featured" ||
      type === "featured_deal" ||
      type === "feature"
    );
  };

  /* =====================================================
     CALCULATE DEAL PRICE
  ===================================================== */

  const getFinalPrice = () => {
    if (!product) {
      return 0;
    }

    const regularPrice = Number(product.price || 0);

    const discountPercent = Number(
      product.discount_percent || 0
    );

    /*
      Current Deal साठी discount लागू करायचा.

      Example:
      Price = ₹1000
      Discount = 20%

      Final Price = ₹800
    */

    if (
      isCurrentDeal() &&
      discountPercent > 0 &&
      discountPercent <= 100
    ) {
      return (
        regularPrice -
        (regularPrice * discountPercent) / 100
      );
    }

    return regularPrice;
  };

  const finalPrice = getFinalPrice();

  const regularPrice = Number(
    product?.price || 0
  );

  const mrp = Number(
    product?.mrp || 0
  );

  const discountPercent = Number(
    product?.discount_percent || 0
  );

  const hasDiscount =
    isCurrentDeal() &&
    discountPercent > 0 &&
    finalPrice < regularPrice;

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async () => {
    try {
      setAdding(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      /*
        IMPORTANT:

        Current Deal असेल तर discounted price
        customer ला pay करायची आहे.

        Featured Deal मध्ये Add to Cart
        allow नाही.

        Normal product मध्ये regular price.
      */

      if (isFeaturedDeal()) {
        alert(
          "Featured deals cannot be added to cart."
        );

        return;
      }

      if (Number(product.stock) <= 0) {
        alert("Product is out of stock");
        return;
      }

      /*
        Backend ला final_price पाठवत आहोत.

        जर backend cart मध्ये price स्वतः
        products table मधून घेत असेल तरी
        खालील field उपयोगी पडेल future validation साठी.
      */

      const response = await API.post(
        "/cart",
        {
          product_id: product.id,
          quantity: 1,
          price: Number(finalPrice.toFixed(2)),
          final_price: Number(
            finalPrice.toFixed(2)
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Product added to cart"
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    } finally {
      setAdding(false);
    }
  };

  /* =====================================================
     LOADING / ERROR
  ===================================================== */

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="product-details">

      {/* BACK */}

      <button
        onClick={() => navigate("/")}
      >
        ← Back to Products
      </button>

      <div className="product-details-content">

        {/* =================================================
            IMAGE
        ================================================= */}

        <div>

          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-details-image"
            />
          )}

        </div>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div className="product-details-info">

          {/* DEAL BADGE */}

          {isCurrentDeal() && (
            <span className="product-deal-badge current">
              🏷️ CURRENT DEAL
            </span>
          )}

          {isFeaturedDeal() && (
            <span className="product-deal-badge featured">
              ⭐ FEATURED DEAL
            </span>
          )}

          <h1>
            {product.name}
          </h1>

          <p>
            {product.description}
          </p>

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="product-price-section">

            {hasDiscount && (
              <span className="product-mrp">
                MRP ₹
                {mrp > 0
                  ? mrp.toFixed(2)
                  : regularPrice.toFixed(2)}
              </span>
            )}

            <h2>
              ₹{finalPrice.toFixed(2)}
            </h2>

            {hasDiscount && (
              <span className="product-discount">
                {discountPercent}% OFF
              </span>
            )}

          </div>

          {/* OFFER TEXT */}

          {isCurrentDeal() &&
            product.offer_text && (
              <p className="product-offer-text">
                🎁 {product.offer_text}
              </p>
            )}

          {/* DEAL TITLE */}

          {product.deal_title && (
            <p className="product-deal-title">
              {product.deal_title}
            </p>
          )}

          {/* COUPON */}

          {isCurrentDeal() &&
            product.coupon_code && (
              <p className="product-coupon">
                🎟️ Coupon:{" "}
                <strong>
                  {product.coupon_code}
                </strong>
              </p>
            )}

          {/* RATING */}

          <p>
            ⭐ {product.rating}
          </p>

          {/* STOCK */}

          <p>
            Stock: {product.stock}
          </p>

          {/* CATEGORY */}

          <p>
            Category:{" "}
            {product.category_name}
          </p>

          {/* =================================================
              ADD TO CART
          ================================================= */}

          {isFeaturedDeal() ? (
            <button
              className="add-cart-btn featured-disabled"
              disabled
            >
              ⭐ Featured Deal
            </button>
          ) : (
            <button
              className="add-cart-btn"
              onClick={handleAddToCart}
              disabled={
                adding ||
                Number(product.stock) <= 0
              }
            >
              {adding
                ? "Adding..."
                : Number(product.stock) <= 0
                ? "Out of Stock"
                : `Add to Cart • ₹${finalPrice.toFixed(
                    2
                  )}`}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default ProductDetails;

