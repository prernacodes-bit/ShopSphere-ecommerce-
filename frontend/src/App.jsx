
import {
  useEffect,
  useState,
  useRef,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import API from "./api/api";
import ProductCard from "./components/ProductCard";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import AdminUsers from "./pages/AdminUsers";
import AdminDeals from "./pages/AdminDeals";

import "./App.css";

/* =====================================================
   CATEGORY STYLES
===================================================== */

const CATEGORY_STYLES = {
  Electronics: {
    icon: "💻",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80&auto=format&fit=crop",
  },

  "Home Appliances": {
    icon: "🏠",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop",
  },

  Clothing: {
    icon: "👕",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80&auto=format&fit=crop",
  },

  Shoes: {
    icon: "👟",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80&auto=format&fit=crop",
  },

  Books: {
    icon: "📚",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1600&q=80&auto=format&fit=crop",
  },

  Sports: {
    icon: "⚽",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&auto=format&fit=crop",
  },

  Toys: {
    icon: "🧸",
    image:
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1600&q=80&auto=format&fit=crop",
  },

  Beauty: {
    icon: "💄",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80&auto=format&fit=crop",
  },
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&auto=format&fit=crop";

const NO_IMAGE =
  "https://placehold.co/600x600/png?text=No+Image";

/* =====================================================
   CATEGORY HELPER
===================================================== */

const getCategoryStyle = (name) => {
  if (!name) {
    return {
      icon: "🛍️",
      image: DEFAULT_IMAGE,
    };
  }

  return (
    CATEGORY_STYLES[name] || {
      icon: "🛍️",
      image: DEFAULT_IMAGE,
    }
  );
};

/* =====================================================
   DEAL TYPE HELPERS
===================================================== */

const normalizeDealType = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
};

const isFeaturedDeal = (product) => {
  const type = normalizeDealType(
    product.deal_type ||
      product.dealType ||
      product.deal
  );

  return (
    type === "featured" ||
    type === "featured_deal" ||
    type === "feature"
  );
};

const isCurrentDeal = (product) => {
  const type = normalizeDealType(
    product.deal_type ||
      product.dealType ||
      product.deal
  );

  return (
    type === "deal" ||
    type === "current" ||
    type === "current_deal" ||
    type === "current_offer" ||
    type === "offer"
  );
};

/* =====================================================
   HERO + CATEGORY SLIDER
===================================================== */

function CategorySlider({
  categories = [],
  onSelectCategory,
}) {
  const [current, setCurrent] = useState(0);

  const slides =
    categories.length > 0
      ? categories.map((cat) => {
          const style = getCategoryStyle(cat.name);

          return {
            id: cat.id,
            tag: "SHOP CATEGORY",
            title: cat.name,

            subtitle:
              cat.description ||
              `Explore our wide range of ${cat.name.toLowerCase()}`,

            button: `Shop ${cat.name}`,

            emoji: style.icon,

            image: style.image,
          };
        })
      : [
          {
            tag: "WELCOME",
            title: "Discover Amazing Products",
            subtitle: "Loading categories…",
            button: "Browse All",
            emoji: "🛍️",
            image: DEFAULT_IMAGE,
          },
        ];

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrent(
        (prev) => (prev + 1) % slides.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setCurrent(0);
  }, [categories.length]);

  const goTo = (index) => {
    setCurrent(index);
  };

  const next = () => {
    setCurrent(
      (prev) => (prev + 1) % slides.length
    );
  };

  const prev = () => {
    setCurrent(
      (prev) =>
        (prev - 1 + slides.length) %
        slides.length
    );
  };

  const slide = slides[current];

  const handleClick = () => {
    if (slide.id && onSelectCategory) {
      onSelectCategory(String(slide.id));

      const element =
        document.getElementById(
          "all-products"
        );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section className="hero-slider">
      <div
        className="hero-slide"
        style={{
          backgroundImage: `url(${slide.image})`,
        }}
      >
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-tag">
            {slide.emoji} {slide.tag}
          </span>

          <h1 className="hero-title">
            {slide.title}
          </h1>

          <p className="hero-subtitle">
            {slide.subtitle}
          </p>

          <div className="hero-actions">
            <button
              className="hero-btn-primary"
              onClick={handleClick}
            >
              {slide.button}

              <span className="hero-btn-arrow">
                →
              </span>
            </button>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              className="hero-nav hero-nav-prev"
              onClick={prev}
              aria-label="Previous"
            >
              ‹
            </button>

            <button
              className="hero-nav hero-nav-next"
              onClick={next}
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className="hero-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={
                  index === current
                    ? "hero-dot active"
                    : "hero-dot"
                }
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${
                  index + 1
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =====================================================
   PRODUCT DEAL CARD
   NOTE:
   हा card फक्त Featured / Current Deals साठी आहे.
   Data /deals API मधून येतो.
===================================================== */

function DealCard({ product, type }) {
  const navigate = useNavigate();

  const price = Number(
    product.price || 0
  );

  const mrp =
    product.mrp !== null &&
    product.mrp !== undefined &&
    product.mrp !== ""
      ? Number(product.mrp)
      : null;

  const discount = Number(
    product.discount_percent || 0
  );

  return (
    <div
      className="deal-card"
      onClick={() =>
        navigate(
          `/products/${product.id}`
        )
      }
    >
      <div className="deal-image-wrap">
        <img
          src={
            product.image_url ||
            product.image ||
            NO_IMAGE
          }
          alt={product.name}
          className="deal-image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              NO_IMAGE;
          }}
        />

        <span className="deal-badge">
          {type === "featured"
            ? "FEATURED"
            : "CURRENT DEAL"}
        </span>
      </div>

      <div className="deal-body">
        <span className="deal-category">
          {product.category_name ||
            product.category ||
            "Product"}
        </span>

        <h3 className="deal-title">
          {product.name}
        </h3>

        {/* DEAL TITLE */}

        {product.deal_title && (
          <strong className="deal-special-title">
            {product.deal_title}
          </strong>
        )}

        {/* PRICE */}

        <div className="deal-price-row">
          {mrp !== null &&
            mrp > price && (
              <span className="deal-mrp">
                ₹{mrp.toFixed(0)}
              </span>
            )}

          <span className="deal-price">
            ₹{price.toFixed(0)}
          </span>

          {discount > 0 && (
            <span className="deal-discount">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* OFFER TEXT */}

        {product.offer_text && (
          <p className="deal-offer-text">
            {product.offer_text}
          </p>
        )}

        {/* COUPON */}

        {product.coupon_code && (
          <div className="deal-coupon">
            🎟️ {product.coupon_code}
          </div>
        )}

        <div className="deal-footer">
          <span className="deal-rating">
            ⭐{" "}
            {Number(
              product.rating || 0
            ).toFixed(1)}
          </span>

          <span className="deal-save">
            {product.deal_stock !== null &&
            product.deal_stock !== undefined
              ? `${product.deal_stock} deal stock`
              : Number(product.stock) > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   FEATURED DEALS
===================================================== */

function FeaturedDeals({ deals = [] }) {
  const featuredProducts =
    deals.filter(isFeaturedDeal);

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="featured-deals">
      <div className="featured-header">
        <div>
          <h2 className="section-title">
            🔥 Featured Deals
          </h2>

          <p className="featured-sub">
            Hand-picked featured products
          </p>
        </div>
      </div>

      <DealSlider
        products={featuredProducts}
        type="featured"
      />
    </section>
  );
}

/* =====================================================
   CURRENT DEALS
===================================================== */

function CurrentDeals({ deals = [] }) {
  const currentProducts =
    deals.filter(isCurrentDeal);

  if (currentProducts.length === 0) {
    return null;
  }

  return (
    <section className="featured-deals">
      <div className="featured-header">
        <div>
          <h2 className="section-title">
            🏷️ Current Deals
          </h2>

          <p className="featured-sub">
            Check out our current offers
          </p>
        </div>
      </div>

      <DealSlider
        products={currentProducts}
        type="deal"
      />
    </section>
  );
}

/* =====================================================
   DEAL HORIZONTAL SLIDER — INFINITE LOOP
   Featured + Current Deals sathi
   Continuous horizontal movement
===================================================== */

function DealSlider({ products = [], type }) {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider || products.length === 0) {
      return;
    }

    let animationFrame;
    let lastTime = 0;
    let isPaused = false;
    let pauseTimeout;

    const speed = 0.35; // ⚡ Fast speed

    /*
      Duplicate content chi width = original content chi width.
      Half width par pahunchlyavar scrollLeft reset kela
      tar user la kळणar nahi ki reset zala.
    */
    const animate = (time) => {
      if (!lastTime) {
        lastTime = time;
      }

      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused) {
        slider.scrollLeft += speed * delta;

        const halfWidth = slider.scrollWidth / 2;

        // Jar half (first set) cross zala tar silently reset
        if (slider.scrollLeft >= halfWidth) {
          slider.scrollLeft -= halfWidth;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    /* ============ HOVER PAUSE ============ */
    const handleMouseEnter = () => {
      isPaused = true;
      clearTimeout(pauseTimeout);
    };

    const handleMouseLeave = () => {
      pauseTimeout = setTimeout(() => {
        isPaused = false;
      }, 600);
    };

    slider.addEventListener("mouseenter", handleMouseEnter);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("touchstart", handleMouseEnter, { passive: true });
    slider.addEventListener("touchend", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(pauseTimeout);
      slider.removeEventListener("mouseenter", handleMouseEnter);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("touchstart", handleMouseEnter);
      slider.removeEventListener("touchend", handleMouseLeave);
    };
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  /*
    IMPORTANT:
    Cards 2 vela render karayche ahet (duplicate).
    Yane infinite loop hoil — shevat nahi disnar.
  */
  const loopProducts = [...products, ...products];

  return (
    <div
      className="deal-slider-wrapper"
      ref={sliderRef}
    >
      <div className="deal-slider-track">
        {loopProducts.map((product, index) => (
          <div
            className="deal-slider-item"
            key={`${product.id}-${index}`}
          >
            <DealCard
              product={product}
              type={type}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


/* =====================================================
   HOME PAGE
===================================================== */

function Home() {
  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("");

  const [categories, setCategories] =
    useState([]);

  /* =================================================
     ALL PRODUCTS
     हे /products API मधूनच येतील.
  ================================================= */

  const [products, setProducts] =
    useState([]);

  /* =================================================
     DEALS
     हे /deals API मधून येतील.
  ================================================= */

  const [deals, setDeals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          IMPORTANT:

          /categories
          /products  -> All Products साठी
          /deals     -> Featured + Current Deals साठी

          त्यामुळे Admin Deals मधून केलेले changes
          फक्त deal sections मध्ये वापरले जातील.
        */

        const [
          categoriesResponse,
          productsResponse,
          dealsResponse,
        ] = await Promise.all([
          API.get("/categories"),
          API.get("/products"),
          API.get("/deals"),
        ]);

        const loadedCategories =
          categoriesResponse.data
            ?.categories || [];

        const loadedProducts =
          productsResponse.data
            ?.products || [];

        const loadedDeals =
          dealsResponse.data
            ?.deals || [];

        setCategories(
          loadedCategories
        );

        /*
          ALL PRODUCTS
          यामध्ये कोणताही बदल नाही.
        */

        setProducts(
          loadedProducts
        );

        /*
          FEATURED + CURRENT DEALS
          स्वतंत्र /deals API data.
        */

        setDeals(
          loadedDeals
        );

        console.log(
          "All Products:",
          loadedProducts
        );

        console.log(
          "Deals:",
          loadedDeals
        );

        console.log(
          "Deal Types:",
          loadedDeals.map(
            (deal) => ({
              id: deal.id,
              name: deal.name,
              deal_type:
                deal.deal_type,
              deal_title:
                deal.deal_title,
              offer_text:
                deal.offer_text,
              coupon_code:
                deal.coupon_code,
              mrp: deal.mrp,
              discount_percent:
                deal.discount_percent,
              deal_stock:
                deal.deal_stock,
              deal_active:
                deal.deal_active,
            })
          )
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Data load failed"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =================================================
     ALL PRODUCTS FILTER

     IMPORTANT:
     हा filter फक्त products state वर आहे.
     Deals चा याच्याशी काही संबंध नाही.
  ================================================= */

  const filteredProducts =
    products.filter((product) => {
      const productName =
        String(
          product.name || ""
        ).toLowerCase();

      const searchText =
        String(search || "")
          .toLowerCase()
          .trim();

      const matchesSearch =
        productName.includes(
          searchText
        );

      const matchesCategory =
        selectedCategory === "" ||
        String(
          product.category_id
        ) ===
          String(selectedCategory);

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  return (
    <div className="app">

      {/* =================================================
          HERO
      ================================================= */}

      <CategorySlider
        categories={categories}
        onSelectCategory={
          setSelectedCategory
        }
      />

      <main className="container">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="home-loading">
            <div className="home-spinner" />

            <p>
              Loading amazing
              products…
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="home-error">
            <span>⚠</span>{" "}
            {error}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {!loading && !error && (
          <>

            {/* =================================================
                FEATURED DEALS

                /deals API
            ================================================= */}

            <FeaturedDeals
              deals={deals}
            />

            {/* =================================================
                CURRENT DEALS

                /deals API
            ================================================= */}

            <CurrentDeals
              deals={deals}
            />

            {/* =================================================
                ALL PRODUCTS

                /products API

                यामध्ये कोणताही deal-specific change नाही.
            ================================================= */}

            <section
              id="all-products"
            >
              <h2 className="section-title">
                All Products
              </h2>

              {/* =================================================
                  CATEGORY FILTER CHIP
              ================================================= */}

              {selectedCategory && (
                <div className="active-filter-chip">

                  <span>
                    Filtered by:{" "}

                    <strong>
                      {
                        categories.find(
                          (category) =>
                            String(
                              category.id
                            ) ===
                            String(
                              selectedCategory
                            )
                        )?.name ||
                        "Category"
                      }
                    </strong>
                  </span>

                  <button
                    className="active-filter-clear"
                    onClick={() =>
                      setSelectedCategory(
                        ""
                      )
                    }
                  >
                    ✕
                  </button>

                </div>
              )}

              {/* =================================================
                  SEARCH + CATEGORY
              ================================================= */}

              <div className="product-filters">

                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

                <select
                  value={
                    selectedCategory
                  }
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* =================================================
                  PRODUCTS
              ================================================= */}

              {filteredProducts.length ===
              0 ? (
                <div className="home-empty">
                  <span>🔍</span>

                  <p>
                    No products found.
                  </p>
                </div>
              ) : (
                <div className="products">

                  {filteredProducts.map(
                    (product) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    )
                  )}

                </div>
              )}

            </section>

          </>
        )}

      </main>
    </div>
  );
}

/* =====================================================
   APP ROUTES
===================================================== */

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products/:id"
          element={
            <ProductDetails />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =================================================
            USER
        ================================================= */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/deals"
          element={
            <ProtectedRoute adminOnly>
              <AdminDeals />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;

