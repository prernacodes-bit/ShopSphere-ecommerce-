const db = require("../config/db").promise();

// =========================
// ADD TO WISHLIST
// =========================

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    // Check product exists
    const [products] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check already in wishlist
    const [existing] = await db.query(
      `SELECT id
       FROM wishlists
       WHERE user_id = ?
       AND product_id = ?`,
      [userId, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Product already in wishlist",
      });
    }

    // Add wishlist
    await db.query(
      `INSERT INTO wishlists
       (user_id, product_id)
       VALUES (?, ?)`,
      [userId, product_id]
    );

    res.status(201).json({
      message: "Product added to wishlist",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add product to wishlist",
    });
  }
};


// =========================
// GET MY WISHLIST
// =========================

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [wishlist] = await db.query(
      `SELECT
        w.id,
        w.product_id,
        p.name,
        p.description,
        p.price,
        p.rating,
        p.stock,
        p.image_url,
        p.category_id,
        c.name AS category_name,
        w.created_at
       FROM wishlists w
       JOIN products p
         ON w.product_id = p.id
       LEFT JOIN categories c
         ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({
      message: "Wishlist fetched successfully",
      wishlist,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch wishlist",
    });
  }
};


// =========================
// REMOVE FROM WISHLIST
// =========================

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const [result] = await db.query(
      `DELETE FROM wishlists
       WHERE user_id = ?
       AND product_id = ?`,
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    res.json({
      message: "Product removed from wishlist",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to remove product from wishlist",
    });
  }
};


module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};