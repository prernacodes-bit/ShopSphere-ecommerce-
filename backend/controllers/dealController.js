const db = require("../config/db");

// =========================
// GET ALL DEALS
// =========================

const getDeals = (req, res) => {
    const sql = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.mrp,
            p.discount_percent,
            p.deal_type,
            p.deal_title,
            p.offer_text,
            p.coupon_code,
            p.deal_stock,
            p.deal_start_at,
            p.deal_end_at,
            p.deal_active,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.id
        WHERE p.deal_type IN ('current', 'featured')
        ORDER BY p.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch deals",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Deals fetched successfully",
            deals: results
        });
    });
};


// =========================
// GET SINGLE DEAL
// =========================

const getDealById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.mrp,
            p.discount_percent,
            p.deal_type,
            p.deal_title,
            p.offer_text,
            p.coupon_code,
            p.deal_stock,
            p.deal_start_at,
            p.deal_end_at,
            p.deal_active,
            p.stock,
            p.image_url,
            p.category_id,
            c.name AS category_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = ?
          AND p.deal_type IN ('current', 'featured')
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch deal",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Deal not found"
            });
        }

        res.status(200).json({
            message: "Deal fetched successfully",
            deal: results[0]
        });
    });
};


// =========================
// UPDATE DEAL
// =========================

const updateDeal = (req, res) => {
    const { id } = req.params;

    const {
        mrp,
        discount_percent,
        deal_type,
        deal_title,
        offer_text,
        coupon_code,
        deal_stock,
        deal_start_at,
        deal_end_at,
        deal_active
    } = req.body;

    const allowedTypes = ["none", "featured", "current"];

    if (!allowedTypes.includes(deal_type)) {
        return res.status(400).json({
            message: "Invalid deal type"
        });
    }

    const sql = `
        UPDATE products
        SET
            mrp = ?,
            discount_percent = ?,
            deal_type = ?,
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
            mrp === undefined || mrp === ""
                ? null
                : Number(mrp),

            discount_percent === undefined || discount_percent === ""
                ? 0
                : Number(discount_percent),

            deal_type,

            deal_title || null,
            offer_text || null,
            coupon_code || null,

            deal_stock === undefined || deal_stock === ""
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
                    message: "Deal update failed",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product/Deal not found"
                });
            }

            res.status(200).json({
                message: "Deal updated successfully"
            });
        }
    );
};


// =========================
// EXPORT
// =========================

module.exports = {
    getDeals,
    getDealById,
    updateDeal
};