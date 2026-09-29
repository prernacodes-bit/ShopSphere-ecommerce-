const db = require("../config/db");

// =========================
// DEAL TYPES
// =========================

const ALLOWED_DEAL_TYPES = [
    "none",
    "featured",
    "current"
];

const getValidDealType = (deal_type) => {
    return ALLOWED_DEAL_TYPES.includes(deal_type)
        ? deal_type
        : "none";
};


// =========================
// GET ALL PRODUCTS
// =========================

const getProducts = (req, res) => {

    const sql = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.rating,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name,

            p.deal_type,
            p.mrp,
            p.discount_percent,
            p.deal_title,
            p.offer_text,
            p.coupon_code,
            p.deal_stock,
            p.deal_start_at,
            p.deal_end_at,
            p.deal_active,

            p.created_at

        FROM products p

        JOIN categories c
            ON p.category_id = c.id

        ORDER BY p.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Products fetched successfully",
            products: results
        });
    });
};


// =========================
// GET SINGLE PRODUCT
// =========================

const getProductById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.rating,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name,

            p.deal_type,
            p.mrp,
            p.discount_percent,
            p.deal_title,
            p.offer_text,
            p.coupon_code,
            p.deal_stock,
            p.deal_start_at,
            p.deal_end_at,
            p.deal_active,

            p.created_at

        FROM products p

        JOIN categories c
            ON p.category_id = c.id

        WHERE p.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = results[0];

        /*
         * Deal information फक्त Featured / Current
         * product साठी expose करायची.
         *
         * Normal product साठी product data
         * unchanged राहील.
         */

        if (
            product.deal_type !== "featured" &&
            product.deal_type !== "current"
        ) {
            product.mrp = null;
            product.discount_percent = 0;
            product.deal_title = null;
            product.offer_text = null;
            product.coupon_code = null;
            product.deal_stock = null;
            product.deal_start_at = null;
            product.deal_end_at = null;
            product.deal_active = false;
        }

        res.status(200).json({
            message: "Product fetched successfully",
            product
        });
    });
};


// =========================
// CREATE PRODUCT
// =========================

const createProduct = (req, res) => {

    const {
        name,
        description,
        price,
        rating,
        stock,
        image_url,
        category_id,

        deal_type,
        mrp,
        discount_percent,
        deal_title,
        offer_text,
        coupon_code,
        deal_stock,
        deal_start_at,
        deal_end_at,
        deal_active
    } = req.body;

    if (!name || price === undefined || !category_id) {
        return res.status(400).json({
            message:
                "Name, price and category_id are required"
        });
    }

    const finalDealType =
        getValidDealType(deal_type);

    const sql = `
        INSERT INTO products
        (
            name,
            description,
            price,
            rating,
            stock,
            image_url,
            category_id,

            deal_type,
            mrp,
            discount_percent,
            deal_title,
            offer_text,
            coupon_code,
            deal_stock,
            deal_start_at,
            deal_end_at,
            deal_active
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,

            description || null,

            price,

            rating === undefined
                ? 0
                : Number(rating),

            stock === undefined
                ? 0
                : Number(stock),

            image_url || null,

            category_id,

            finalDealType,

            mrp === undefined || mrp === ""
                ? null
                : Number(mrp),

            discount_percent === undefined ||
            discount_percent === ""
                ? 0
                : Number(discount_percent),

            deal_title || null,

            offer_text || null,

            coupon_code || null,

            deal_stock === undefined ||
            deal_stock === ""
                ? null
                : Number(deal_stock),

            deal_start_at || null,

            deal_end_at || null,

            deal_active ? 1 : 0
        ],

        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Product creation failed",
                    error: err.message
                });
            }

            res.status(201).json({
                message:
                    "Product created successfully",

                productId:
                    result.insertId,

                deal_type:
                    finalDealType
            });
        }
    );
};


// =========================
// UPDATE PRODUCT
// =========================

const updateProduct = (req, res) => {

    const { id } = req.params;

    const {
        name,
        description,
        price,
        rating,
        stock,
        image_url,
        category_id,

        deal_type,
        mrp,
        discount_percent,
        deal_title,
        offer_text,
        coupon_code,
        deal_stock,
        deal_start_at,
        deal_end_at,
        deal_active
    } = req.body;

    if (!name || price === undefined || !category_id) {
        return res.status(400).json({
            message:
                "Name, price and category_id are required"
        });
    }

    const finalDealType =
        getValidDealType(deal_type);

    const sql = `
        UPDATE products

        SET
            name = ?,
            description = ?,
            price = ?,
            rating = ?,
            stock = ?,
            image_url = ?,
            category_id = ?,

            deal_type = ?,
            mrp = ?,
            discount_percent = ?,
            deal_title = ?,
            offer_text = ?,
            coupon_code = ?,
            deal_stock = ?,
            deal_start_at = ?,
            deal_end_at = ?,
            deal_active = ?

        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,

            description || null,

            price,

            rating === undefined
                ? 0
                : Number(rating),

            stock === undefined
                ? 0
                : Number(stock),

            image_url || null,

            category_id,

            finalDealType,

            mrp === undefined || mrp === ""
                ? null
                : Number(mrp),

            discount_percent === undefined ||
            discount_percent === ""
                ? 0
                : Number(discount_percent),

            deal_title || null,

            offer_text || null,

            coupon_code || null,

            deal_stock === undefined ||
            deal_stock === ""
                ? null
                : Number(deal_stock),

            deal_start_at || null,

            deal_end_at || null,

            deal_active ? 1 : 0,

            id
        ],

        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Product update failed",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Product not found"
                });
            }

            res.status(200).json({
                message:
                    "Product updated successfully",

                deal_type:
                    finalDealType
            });
        }
    );
};


// =========================
// UPDATE PRODUCT STOCK
// =========================

const updateProductStock = (req, res) => {

    const { id } = req.params;

    const { stock } = req.body;

    if (stock === undefined) {
        return res.status(400).json({
            message: "Stock is required"
        });
    }

    if (
        Number.isNaN(Number(stock)) ||
        Number(stock) < 0
    ) {
        return res.status(400).json({
            message:
                "Stock must be a valid number greater than or equal to 0"
        });
    }

    const sql = `
        UPDATE products

        SET stock = ?

        WHERE id = ?
    `;

    db.query(
        sql,
        [
            Number(stock),
            id
        ],

        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Failed to update product stock",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Product not found"
                });
            }

            res.status(200).json({
                message:
                    "Product stock updated successfully",

                stock:
                    Number(stock)
            });
        }
    );
};


// =========================
// DELETE PRODUCT
// =========================

const deleteProduct = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM products
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Product deletion failed",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message:
                        "Product not found"
                });
            }

            res.status(200).json({
                message:
                    "Product deleted successfully"
            });
        }
    );
};


// =========================
// EXPORT
// =========================

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
};