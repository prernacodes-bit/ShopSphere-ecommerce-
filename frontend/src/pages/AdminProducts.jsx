
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

const DEAL_TYPES = {
  NONE: "none",
  FEATURED: "featured",
  CURRENT: "current",
};

const DEAL_LABELS = {
  [DEAL_TYPES.NONE]: "No Deal",
  [DEAL_TYPES.FEATURED]: "Featured Deal",
  [DEAL_TYPES.CURRENT]: "Current Deal",
};

const NO_IMAGE =
  "https://placehold.co/600x600/png?text=No+Image";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // =========================
  // ADD PRODUCT FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    rating: "",
    stock: "",
    image_url: "",
    category_id: "",
    deal_type: DEAL_TYPES.NONE,
  });

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");

      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");

      setCategories(response.data.categories || []);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // =========================
  // ADD FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // ADD PRODUCT
  // =========================

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await API.post(
        "/products",
        {
          name: formData.name.trim(),

          description:
            formData.description.trim(),

          price: Number(formData.price),

          rating:
            formData.rating === ""
              ? 0
              : Number(formData.rating),

          stock:
            formData.stock === ""
              ? 0
              : Number(formData.stock),

          image_url:
            formData.image_url.trim(),

          category_id:
            Number(formData.category_id),

          deal_type:
            formData.deal_type ||
            DEAL_TYPES.NONE,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product created successfully"
      );

      // RESET FORM

      setFormData({
        name: "",
        description: "",
        price: "",
        rating: "",
        stock: "",
        image_url: "",
        category_id: "",
        deal_type: DEAL_TYPES.NONE,
      });

      setShowForm(false);

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // START EDIT
  // =========================

  const handleEdit = (product) => {
    setEditingProduct({
      id: product.id,

      name: product.name || "",

      description:
        product.description || "",

      price: product.price ?? "",

      rating: product.rating ?? "",

      stock: product.stock ?? "",

      image_url:
        product.image_url || "",

      category_id:
        product.category_id || "",

      deal_type:
        product.deal_type ||
        DEAL_TYPES.NONE,
    });

    setShowForm(false);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await API.put(
        `/products/${editingProduct.id}`,
        {
          name:
            editingProduct.name.trim(),

          description:
            editingProduct.description.trim(),

          price:
            Number(editingProduct.price),

          rating:
            editingProduct.rating === ""
              ? 0
              : Number(editingProduct.rating),

          stock:
            editingProduct.stock === ""
              ? 0
              : Number(editingProduct.stock),

          image_url:
            editingProduct.image_url.trim(),

          category_id:
            Number(
              editingProduct.category_id
            ),

          deal_type:
            editingProduct.deal_type ||
            DEAL_TYPES.NONE,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product updated successfully"
      );

      setEditingProduct(null);

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // UPDATE STOCK
  // =========================

  const handleStockUpdate = async (
    productId,
    newStock
  ) => {
    const stock = Number(newStock);

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      setMessage(
        "Stock must be 0 or greater"
      );

      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await API.put(
        `/products/${productId}/stock`,
        {
          stock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product stock updated successfully"
      );

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await API.delete(
        `/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Product deleted successfully"
      );

      await fetchProducts();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="admin-page">
        <p>Loading products...</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="admin-page">

    
      {/* MESSAGE */}

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}


      {/* =================================================
          EDIT PRODUCT FORM
      ================================================= */}

      {editingProduct && (

        <form
          className="admin-product-form"
          onSubmit={handleUpdateProduct}
        >

          <h2>Edit Product</h2>

          <div className="admin-form-grid">

            {/* NAME */}

            <div className="admin-form-group">

              <label>
                Product Name
              </label>

              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name: e.target.value,
                  })
                }
                required
              />

            </div>


            {/* CATEGORY */}

            <div className="admin-form-group">

              <label>
                Category
              </label>

              <select
                value={
                  editingProduct.category_id
                }
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category_id:
                      e.target.value,
                  })
                }
                required
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* DEAL TYPE */}

            <div className="admin-form-group">

              <label>
                Deal Type
              </label>

              <select
                value={
                  editingProduct.deal_type ||
                  DEAL_TYPES.NONE
                }
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    deal_type:
                      e.target.value,
                  })
                }
              >

                <option
                  value={DEAL_TYPES.NONE}
                >
                  No Deal
                </option>

                <option
                  value={DEAL_TYPES.FEATURED}
                >
                  Featured Deal
                </option>

                <option
                  value={DEAL_TYPES.CURRENT}
                >
                  Current Deal
                </option>

              </select>

            </div>


            {/* PRICE */}

            <div className="admin-form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                required
              />

            </div>


            {/* RATING */}

            <div className="admin-form-group">

              <label>
                Rating
              </label>

              <input
                type="number"
                value={editingProduct.rating}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    rating: e.target.value,
                  })
                }
                min="0"
                max="5"
                step="0.1"
              />

            </div>


            {/* STOCK */}

            <div className="admin-form-group">

              <label>
                Stock
              </label>

              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: e.target.value,
                  })
                }
                min="0"
                required
              />

            </div>


            {/* IMAGE */}

            <div className="admin-form-group">

              <label>
                Image URL
              </label>

              <input
                type="url"
                value={
                  editingProduct.image_url
                }
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    image_url:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="admin-form-group">

            <label>
              Description
            </label>

            <textarea
              value={
                editingProduct.description
              }
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  description:
                    e.target.value,
                })
              }
              rows="4"
            />

          </div>


          {/* BUTTONS */}

          <div className="admin-form-actions">

            <button
              type="submit"
              className="admin-submit-btn"
              disabled={submitting}
            >
              {submitting
                ? "Updating..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() =>
                setEditingProduct(null)
              }
            >
              Cancel
            </button>

          </div>

        </form>

      )}


      {/* PRODUCT HEADER */}

      <div className="admin-product-header">

        <h2>
          All Products
        </h2>

        <button
          className="admin-add-btn"
          onClick={() => {

            setShowForm(!showForm);

            setEditingProduct(null);

            setMessage("");

          }}
        >
          {showForm
            ? "Close Form"
            : "+ Add Product"}
        </button>

      </div>


      {/* =================================================
          ADD PRODUCT FORM
      ================================================= */}

      {showForm && (

        <form
          className="admin-product-form"
          onSubmit={handleAddProduct}
        >

          <h2>
            Add New Product
          </h2>

          <div className="admin-form-grid">

            {/* NAME */}

            <div className="admin-form-group">

              <label>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />

            </div>


            {/* CATEGORY */}

            <div className="admin-form-group">

              <label>
                Category
              </label>

              <select
                name="category_id"
                value={
                  formData.category_id
                }
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* DEAL TYPE */}

            <div className="admin-form-group">

              <label>
                Deal Type
              </label>

              <select
                name="deal_type"
                value={formData.deal_type}
                onChange={handleChange}
              >

                <option
                  value={DEAL_TYPES.NONE}
                >
                  No Deal
                </option>

                <option
                  value={DEAL_TYPES.FEATURED}
                >
                  Featured Deal
                </option>

                <option
                  value={DEAL_TYPES.CURRENT}
                >
                  Current Deal
                </option>

              </select>

            </div>


            {/* PRICE */}

            <div className="admin-form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />

            </div>


            {/* RATING */}

            <div className="admin-form-group">

              <label>
                Rating
              </label>

              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="0 - 5"
                min="0"
                max="5"
                step="0.1"
              />

            </div>


            {/* STOCK */}

            <div className="admin-form-group">

              <label>
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock"
                min="0"
              />

            </div>


            {/* IMAGE */}

            <div className="admin-form-group">

              <label>
                Image URL
              </label>

              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://..."
              />

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="admin-form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
            />

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : "Create Product"}
          </button>

        </form>

      )}


      {/* =================================================
          PRODUCT LIST
      ================================================= */}

      {products.length === 0 ? (

        <p>
          No products found.
        </p>

      ) : (

        <div className="admin-products-list">

          {products.map((product) => (

            <div
              className="admin-product-card"
              key={product.id}
            >

              <img
                src={
                  product.image_url ||
                  NO_IMAGE
                }
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror =
                    null;

                  e.currentTarget.src =
                    NO_IMAGE;
                }}
              />


              <div className="admin-product-info">

                <h3>
                  {product.name}
                </h3>

                <p>
                  Category:{" "}
                  {product.category_name}
                </p>

                <p>
                  Price: ₹
                  {Number(
                    product.price
                  ).toFixed(2)}
                </p>

                <p>
                  Stock:{" "}
                  {product.stock}
                </p>

                <p>
                  Rating: ⭐{" "}
                  {Number(
                    product.rating || 0
                  ).toFixed(1)}
                </p>


                {/* DEAL */}

                <p>
                  Deal:{" "}

                  <strong>
                    {
                      DEAL_LABELS[
                        product.deal_type
                      ] ||
                      DEAL_LABELS[
                        DEAL_TYPES.NONE
                      ]
                    }
                  </strong>
                </p>

              </div>


              {/* ACTIONS */}

              <div className="admin-product-actions">

                <button
                  className="admin-edit-btn"
                  onClick={() =>
                    handleEdit(product)
                  }
                >
                  Edit
                </button>

                <button
                  className="admin-delete-btn"
                  onClick={() =>
                    handleDelete(
                      product.id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminProducts;

