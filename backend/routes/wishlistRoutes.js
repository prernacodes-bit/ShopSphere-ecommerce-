const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add product
router.post("/", protect, addToWishlist);

// Get my wishlist
router.get("/", protect, getWishlist);

// Remove product
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;