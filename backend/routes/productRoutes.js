
const express = require("express");

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// =========================
// PUBLIC ROUTES
// =========================

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);


// =========================
// ADMIN ONLY ROUTES
// =========================

// Create product
router.post(
    "/",
    protect,
    adminOnly,
    createProduct
);

// Update product
router.put(
    "/:id",
    protect,
    adminOnly,
    updateProduct
);

// Delete product
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteProduct
);

// Update product stock
router.put(
    "/:id/stock",
    protect,
    adminOnly,
    updateProductStock
);


module.exports = router;

