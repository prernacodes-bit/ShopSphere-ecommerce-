const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus,
    getSalesDashboard
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// =========================
// ADMIN ROUTES (specific first)
// =========================

// Sales dashboard (MUST come before /admin/:id)
router.get(
    "/admin/dashboard",
    protect,
    adminOnly,
    getSalesDashboard
);

// Get all orders
router.get(
    "/admin/all",
    protect,
    adminOnly,
    getAllOrders
);

// Update order status
router.put(
    "/admin/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);

// Get specific order details (LAST - generic param)
router.get(
    "/admin/:id",
    protect,
    adminOnly,
    getAdminOrderDetails
);


// =========================
// NORMAL USER ROUTES
// =========================

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrderDetails);


module.exports = router;