
const db = require("../config/db");

// =====================================================
// CREATE ORDER FROM CART
// =====================================================

const createOrder = (req, res) => {
    const userId = req.user.id;

    // GET CART + CURRENT PRODUCT STOCK
    const cartSql = `
        SELECT 
            c.product_id,
            c.quantity,
            p.name,
            p.price,
            p.stock
        FROM cart c
        JOIN products p
            ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.query(cartSql, [userId], (err, cartItems) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch cart",
                error: err.message
            });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // CHECK STOCK
        for (const item of cartItems) {

            if (Number(item.stock) <= 0) {
                return res.status(400).json({
                    message: `${item.name} is out of stock`
                });
            }

            if (Number(item.quantity) > Number(item.stock)) {
                return res.status(400).json({
                    message:
                        `Only ${item.stock} ${item.name} available in stock`
                });
            }
        }

        // CALCULATE TOTAL
        let totalAmount = 0;

        cartItems.forEach((item) => {
            totalAmount +=
                Number(item.price) *
                Number(item.quantity);
        });

        // CREATE ORDER
        const orderSql = `
            INSERT INTO orders
            (user_id, total_amount, status)
            VALUES (?, ?, 'Pending')
        `;

        db.query(
            orderSql,
            [userId, totalAmount],
            (err, orderResult) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to create order",
                        error: err.message
                    });
                }

                const orderId = orderResult.insertId;

                // =====================================================
                // SAVE INITIAL STATUS HISTORY
                // =====================================================

                const historySql = `
                    INSERT INTO order_status_history
                    (order_id, status)
                    VALUES (?, 'Pending')
                `;

                db.query(
                    historySql,
                    [orderId],
                    (historyErr) => {

                        if (historyErr) {
                            return res.status(500).json({
                                message:
                                    "Failed to create order status history",
                                error: historyErr.message
                            });
                        }

                        // =====================================================
                        // CREATE ORDER ITEMS
                        // =====================================================

                        const orderItems = cartItems.map((item) => [
                            orderId,
                            item.product_id,
                            item.quantity,
                            item.price
                        ]);

                        const itemsSql = `
                            INSERT INTO order_items
                            (order_id, product_id, quantity, price)
                            VALUES ?
                        `;

                        db.query(
                            itemsSql,
                            [orderItems],
                            (err) => {

                                if (err) {
                                    return res.status(500).json({
                                        message:
                                            "Failed to create order items",
                                        error: err.message
                                    });
                                }

                                // =====================================================
                                // DEDUCT STOCK
                                // =====================================================

                                let completed = 0;
                                let stockError = false;

                                cartItems.forEach((item) => {

                                    const stockSql = `
                                        UPDATE products
                                        SET stock = stock - ?
                                        WHERE id = ?
                                        AND stock >= ?
                                    `;

                                    db.query(
                                        stockSql,
                                        [
                                            item.quantity,
                                            item.product_id,
                                            item.quantity
                                        ],
                                        (err, result) => {

                                            if (stockError) {
                                                return;
                                            }

                                            if (err) {
                                                stockError = true;

                                                return res.status(500).json({
                                                    message:
                                                        "Failed to update product stock",
                                                    error: err.message
                                                });
                                            }

                                            if (
                                                result.affectedRows === 0
                                            ) {
                                                stockError = true;

                                                return res.status(400).json({
                                                    message:
                                                        `Stock changed for ${item.name}. Please try again.`
                                                });
                                            }

                                            completed++;

                                            // =====================================================
                                            // ALL STOCK UPDATED
                                            // =====================================================

                                            if (
                                                completed ===
                                                cartItems.length
                                            ) {

                                                const clearCartSql = `
                                                    DELETE FROM cart
                                                    WHERE user_id = ?
                                                `;

                                                db.query(
                                                    clearCartSql,
                                                    [userId],
                                                    (err) => {

                                                        if (err) {
                                                            return res.status(500).json({
                                                                message:
                                                                    "Order created but cart could not be cleared",
                                                                error:
                                                                    err.message
                                                            });
                                                        }

                                                        return res.status(201).json({
                                                            message:
                                                                "Order placed successfully",

                                                            orderId:
                                                                orderId,

                                                            totalAmount:
                                                                totalAmount
                                                        });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};


// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            id,
            total_amount,
            status,
            created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [userId],
        (err, orders) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to fetch orders",
                    error: err.message
                });
            }

            res.status(200).json({
                message:
                    "Orders fetched successfully",
                orders
            });
        }
    );
};


// =====================================================
// GET SINGLE ORDER DETAILS
// =====================================================

const getOrderDetails = (req, res) => {

    const userId = req.user.id;
    const orderId = req.params.id;

    const sql = `
        SELECT
            o.id AS order_id,
            o.total_amount,
            o.status,
            o.created_at,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name AS product_name,
            p.image_url
        FROM orders o
        JOIN order_items oi
            ON o.id = oi.order_id
        JOIN products p
            ON oi.product_id = p.id
        WHERE o.id = ?
        AND o.user_id = ?
    `;

    db.query(
        sql,
        [orderId, userId],
        (err, items) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Failed to fetch order details",
                    error: err.message
                });
            }

            if (items.length === 0) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            const order = {
                id: items[0].order_id,

                total_amount:
                    items[0].total_amount,

                status:
                    items[0].status,

                created_at:
                    items[0].created_at,

                items: items.map((item) => ({
                    product_id:
                        item.product_id,

                    product_name:
                        item.product_name,

                    image_url:
                        item.image_url,

                    quantity:
                        item.quantity,

                    price:
                        item.price,

                    subtotal:
                        Number(item.price) *
                        Number(item.quantity)
                }))
            };

            res.status(200).json({
                message:
                    "Order details fetched successfully",

                order
            });
        }
    );
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
            return res.status(500).json({
                message: "Failed to fetch all orders",
                error: err.message
            });
        }

        res.status(200).json({
            message:
                "Admin orders fetched successfully",

            orders
        });
    });
};


// =====================================================
// GET ORDER DETAILS - ADMIN
// WITH STATUS HISTORY
// =====================================================

const getAdminOrderDetails = (req, res) => {

    const orderId = req.params.id;

    // GET ORDER + ITEMS
    const orderSql = `
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
        orderSql,
        [orderId],
        (err, items) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Failed to fetch admin order details",
                    error: err.message
                });
            }

            if (items.length === 0) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            // =====================================================
            // GET STATUS HISTORY
            // =====================================================

            const historySql = `
                SELECT
                    id,
                    status,
                    changed_at
                FROM order_status_history
                WHERE order_id = ?
                ORDER BY changed_at ASC
            `;

            db.query(
                historySql,
                [orderId],
                (historyErr, history) => {

                    if (historyErr) {
                        return res.status(500).json({
                            message:
                                "Failed to fetch order status history",
                            error:
                                historyErr.message
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
                            items[0].total_amount,

                        status:
                            items[0].status,

                        created_at:
                            items[0].created_at,

                        // STATUS HISTORY
                        status_history:
                            history.map((entry) => ({
                                id:
                                    entry.id,

                                status:
                                    entry.status,

                                changed_at:
                                    entry.changed_at
                            })),

                        items:
                            items.map((item) => ({
                                product_id:
                                    item.product_id,

                                product_name:
                                    item.product_name,

                                image_url:
                                    item.image_url,

                                quantity:
                                    item.quantity,

                                price:
                                    item.price,

                                subtotal:
                                    Number(item.price) *
                                    Number(item.quantity)
                            }))
                    };

                    res.status(200).json({
                        message:
                            "Admin order details fetched successfully",

                        order
                    });
                }
            );
        }
    );
};


// =====================================================
// UPDATE ORDER STATUS - ADMIN
// =====================================================

const updateOrderStatus = (req, res) => {

    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    // CHECK STATUS
    if (!status) {
        return res.status(400).json({
            message: "Status is required"
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    // =====================================================
    // GET CURRENT ORDER STATUS
    // =====================================================

    const getOrderSql = `
        SELECT
            id,
            status
        FROM orders
        WHERE id = ?
    `;

    db.query(
        getOrderSql,
        [orderId],
        (err, orders) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Failed to fetch order",
                    error: err.message
                });
            }

            if (orders.length === 0) {
                return res.status(404).json({
                    message:
                        "Order not found"
                });
            }

            const currentStatus =
                orders[0].status;

            // =====================================================
            // SAME STATUS
            // DO NOT CREATE HISTORY DUPLICATE
            // =====================================================

            if (currentStatus === status) {
                return res.status(200).json({
                    message:
                        "Order status is already " +
                        status
                });
            }

            // =====================================================
            // UPDATE ONLY STATUS
            // created_at IS NOT UPDATED
            // =====================================================

            const updateSql = `
                UPDATE orders
                SET status = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [status, orderId],
                (err, result) => {

                    if (err) {
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

                    // =====================================================
                    // SAVE STATUS HISTORY
                    // =====================================================

                    const historySql = `
                        INSERT INTO order_status_history
                        (order_id, status)
                        VALUES (?, ?)
                    `;

                    db.query(
                        historySql,
                        [orderId, status],
                        (historyErr) => {

                            if (historyErr) {
                                return res.status(500).json({
                                    message:
                                        "Order status updated but history could not be saved",

                                    error:
                                        historyErr.message
                                });
                            }

                            return res.status(200).json({
                                message:
                                    "Order status updated successfully"
                            });
                        }
                    );
                }
            );
        }
    );
};


// =====================================================
// ADMIN - SALES DASHBOARD
// =====================================================
const getSalesDashboard = (req, res) => {
    const sql = `
        SELECT
            COUNT(*) AS total_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN status != 'Cancelled'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_sales,

            SUM(
                CASE
                    WHEN status = 'Pending'
                    THEN 1 ELSE 0
                END
            ) AS pending_orders,

            SUM(
                CASE
                    WHEN status = 'Processing'
                    THEN 1 ELSE 0
                END
            ) AS processing_orders,

            SUM(
                CASE
                    WHEN status = 'Shipped'
                    THEN 1 ELSE 0
                END
            ) AS shipped_orders,

            SUM(
                CASE
                    WHEN status = 'Delivered'
                    THEN 1 ELSE 0
                END
            ) AS delivered_orders,

            SUM(
                CASE
                    WHEN status = 'Cancelled'
                    THEN 1 ELSE 0
                END
            ) AS cancelled_orders

        FROM orders
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch sales dashboard",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Sales dashboard fetched successfully",
            dashboard: results[0]
        });
    });
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    getAdminOrderDetails,
    updateOrderStatus,
    getSalesDashboard
};
