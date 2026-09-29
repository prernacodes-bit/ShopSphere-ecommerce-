const db = require("../config/db");

// GET ALL CATEGORIES
const getCategories = (req, res) => {
    const sql = "SELECT * FROM categories ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Categories fetched successfully",
            categories: results
        });
    });
};


// CREATE CATEGORY
const createCategory = (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Category name is required"
        });
    }

    const sql = `
        INSERT INTO categories (name, description)
        VALUES (?, ?)
    `;

    db.query(sql, [name, description || null], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Category creation failed",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Category created successfully",
            categoryId: result.insertId
        });
    });
};


module.exports = {
    getCategories,
    createCategory
};