const db = require("../config/db");

const getProfile = (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT id, name, email, role
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            user: results[0]
        });
    });
};
// =========================
// ADMIN - GET ALL USERS
// =========================

const getAllUsers = (req, res) => {
  const sql = `
    SELECT id, name, email, role
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Failed to fetch users",
        error: err.message,
      });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      users: results,
    });
  });
};
module.exports = {
     getProfile,
  getAllUsers,
};