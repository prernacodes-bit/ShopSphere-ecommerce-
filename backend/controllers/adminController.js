const db = require("../config/db");


// =====================================================
// ADMIN DASHBOARD - STORE OVERVIEW
// =====================================================

const getDashboardStats = (req, res) => {

    const statsSql = `
        SELECT

            (
                SELECT COUNT(*)
                FROM products
            ) AS totalProducts,

            (
                SELECT COUNT(*)
                FROM users
            ) AS totalUsers,

            (
                SELECT COUNT(*)
                FROM orders
            ) AS totalOrders,

            (
                SELECT COUNT(*)
                FROM products
                WHERE stock <= 5
            ) AS lowStockProducts
    `;

    db.query(statsSql, (err, results) => {

        if (err) {

            console.error(
                "Dashboard stats error:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to fetch dashboard statistics",
                error: err.message
            });
        }

        const stats = results[0];

        return res.status(200).json({

            message:
                "Dashboard statistics fetched successfully",

            stats: {

                totalProducts:
                    Number(
                        stats.totalProducts || 0
                    ),

                totalUsers:
                    Number(
                        stats.totalUsers || 0
                    ),

                totalOrders:
                    Number(
                        stats.totalOrders || 0
                    ),

                lowStockProducts:
                    Number(
                        stats.lowStockProducts || 0
                    )
            }
        });
    });
};


// =====================================================
// GET ALL ORDERS - ADMIN
// =====================================================

const getAllOrders = (req, res) => {

    const sql = `
        SELECT
            o.id,
            o.user_id,
            u.name AS customer_name,
            u.email AS customer_email,
            o.total_amount,
            o.status,
            o.created_at

        FROM orders o

        JOIN users u
            ON o.user_id = u.id

        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, orders) => {

        if (err) {

            console.error(
                "Get all orders error:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to fetch all orders",
                error: err.message
            });
        }

        return res.status(200).json({

            message:
                "All orders fetched successfully",

            orders
        });
    });
};


// =====================================================
// GET SINGLE ORDER - ADMIN
// =====================================================

const getAdminOrderDetails = (req, res) => {

    const orderId = req.params.id;

    const sql = `
        SELECT

            o.id AS order_id,
            o.user_id,

            u.name AS customer_name,
            u.email AS customer_email,

            o.total_amount,
            o.status,
            o.created_at,

            oi.product_id,
            oi.quantity,
            oi.price,

            p.name AS product_name,
            p.image_url

        FROM orders o

        JOIN users u
            ON o.user_id = u.id

        JOIN order_items oi
            ON o.id = oi.order_id

        JOIN products p
            ON oi.product_id = p.id

        WHERE o.id = ?
    `;

    db.query(
        sql,
        [orderId],
        (err, items) => {

            if (err) {

                console.error(
                    "Admin order details error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch order details",
                    error: err.message
                });
            }

            if (items.length === 0) {

                return res.status(404).json({
                    message:
                        "Order not found"
                });
            }

            const order = {

                id:
                    items[0].order_id,

                user_id:
                    items[0].user_id,

                customer_name:
                    items[0].customer_name,

                customer_email:
                    items[0].customer_email,

                total_amount:
                    Number(
                        items[0].total_amount || 0
                    ),

                status:
                    items[0].status,

                created_at:
                    items[0].created_at,

                items:
                    items.map((item) => ({

                        product_id:
                            item.product_id,

                        product_name:
                            item.product_name,

                        image_url:
                            item.image_url,

                        quantity:
                            Number(
                                item.quantity
                            ),

                        price:
                            Number(
                                item.price
                            ),

                        subtotal:
                            Number(item.price) *
                            Number(item.quantity)
                    }))
            };

            return res.status(200).json({

                message:
                    "Admin order details fetched successfully",

                order
            });
        }
    );
};


// =====================================================
// UPDATE ORDER STATUS - ADMIN
// =====================================================

const updateOrderStatus = (req, res) => {

    const orderId = req.params.id;

    const { status } = req.body;

    // IMPORTANT:
    // Processing is used by Sales Dashboard
    // so it must be allowed here.

    const allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (!status) {

        return res.status(400).json({
            message:
                "Status is required"
        });
    }

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message:
                "Invalid order status",
            allowedStatuses
        });
    }

    const sql = `
        UPDATE orders

        SET status = ?

        WHERE id = ?
    `;

    db.query(
        sql,
        [status, orderId],
        (err, result) => {

            if (err) {

                console.error(
                    "Update order status error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to update order status",
                    error: err.message
                });
            }

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        "Order not found"
                });
            }

            return res.status(200).json({

                message:
                    "Order status updated successfully",

                status
            });
        }
    );
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getDashboardStats,

    getAllOrders,

    getAdminOrderDetails,

    updateOrderStatus
};