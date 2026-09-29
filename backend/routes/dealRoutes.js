const express = require("express");

const {
    getDeals,
    getDealById,
    updateDeal
} = require("../controllers/dealController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================
// PUBLIC
// =========================

router.get("/", getDeals);

router.get("/:id", getDealById);


// =========================
// ADMIN
// =========================

router.put(
    "/:id",
    protect,
    adminOnly,
    updateDeal
);

module.exports = router;