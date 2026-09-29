const express = require("express");
const adminOnly = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");
const {
  getProfile,
  getAllUsers,
} = require("../controllers/userController");

const router = express.Router();

// Admin - Get all users
router.get(
  "/profile",
  protect,
  getProfile
);

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllUsers
);

module.exports = router;