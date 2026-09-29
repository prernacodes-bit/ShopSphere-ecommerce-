const express = require("express");

const {
    getDashboardStats,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// Dashboard (stats + sales)
router.get(
    "/dashboard",
    protect,
    adminOnly,
    getDashboardStats
);


// All Orders
router.get(
    "/orders",
    protect,
    adminOnly,
    getAllOrders
);


// Single Order Details
router.get(
    "/orders/:id",
    protect,
    adminOnly,
    getAdminOrderDetails
);


// Update Order Status
router.put(
    "/orders/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);


module.exports = router;