
const db = require("../config/db");

// =====================================================
// PRICE HELPER
// =====================================================

const calculateFinalPrice = (product) => {
    const regularPrice = Number(product.price || 0);

    const discountPercent = Number(
        product.discount_percent || 0
    );

    const dealType = String(
        product.deal_type || ""
    )
        .toLowerCase()
        .trim();

    /*
        फक्त CURRENT DEAL ला discount लागू होईल.

        Example:
        Price = 1000
        Discount = 20%

        Final Price = 800
    */

    if (
        dealType === "current" &&
        discountPercent > 0 &&
        discountPercent <= 100
    ) {
        return Number(
            (
                regularPrice -
                (regularPrice * discountPercent) / 100
            ).toFixed(2)
        );
    }

    // Featured / Normal Product
    return Number(
        regularPrice.toFixed(2)
    );
};


// =====================================================
// ADD PRODUCT TO CART
// =====================================================

const addToCart = (req, res) => {
    const userId = req.user.id;

    const {
        product_id,
        quantity
    } = req.body;

    if (!product_id) {
        return res.status(400).json({
            message: "product_id is required"
        });
    }

    const qty = Number(quantity) || 1;

    if (qty < 1) {
        return res.status(400).json({
            message: "Quantity must be at least 1"
        });
    }

    // =================================================
    // CHECK PRODUCT + STOCK + DEAL
    // =================================================

    const productSql = `
        SELECT
            id,
            name,
            price,
            stock,
            deal_type,
            discount_percent,
            deal_active,
            deal_start_at,
            deal_end_at
        FROM products
        WHERE id = ?
    `;

    db.query(
        productSql,
        [product_id],
        (err, products) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (products.length === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            const product = products[0];

            // =================================================
            // FEATURED DEAL CANNOT BE ADDED TO CART
            // =================================================

            if (
                String(product.deal_type)
                    .toLowerCase()
                    .trim() === "featured"
            ) {
                return res.status(400).json({
                    message:
                        "Featured deals cannot be added to cart"
                });
            }

            // =================================================
            // STOCK CHECK
            // =================================================

            if (Number(product.stock) <= 0) {
                return res.status(400).json({
                    message:
                        "Product is out of stock"
                });
            }

            // =================================================
            // REQUESTED QUANTITY > STOCK
            // =================================================

            if (
                qty > Number(product.stock)
            ) {
                return res.status(400).json({
                    message:
                        `Only ${product.stock} items available in stock`
                });
            }

            // =================================================
            // CALCULATE FINAL PRICE
            // =================================================

            const finalPrice =
                calculateFinalPrice(product);

            // =================================================
            // CHECK EXISTING CART ITEM
            // =================================================

            const cartSql = `
                SELECT
                    id,
                    quantity
                FROM cart
                WHERE user_id = ?
                AND product_id = ?
            `;

            db.query(
                cartSql,
                [
                    userId,
                    product_id
                ],
                (err, cartItems) => {

                    if (err) {
                        return res.status(500).json({
                            message:
                                "Database error",
                            error:
                                err.message
                        });
                    }

                    // =================================================
                    // PRODUCT ALREADY IN CART
                    // =================================================

                    if (
                        cartItems.length > 0
                    ) {

                        const currentQuantity =
                            Number(
                                cartItems[0]
                                    .quantity
                            );

                        const newQuantity =
                            currentQuantity +
                            qty;

                        // CHECK TOTAL QUANTITY
                        if (
                            newQuantity >
                            Number(
                                product.stock
                            )
                        ) {
                            return res.status(400).json({
                                message:
                                    `Only ${product.stock} items available in stock`
                            });
                        }

                        const updateSql = `
                            UPDATE cart
                            SET quantity = ?
                            WHERE id = ?
                        `;

                        db.query(
                            updateSql,
                            [
                                newQuantity,
                                cartItems[0].id
                            ],
                            (err) => {

                                if (err) {
                                    return res.status(
                                        500
                                    ).json({
                                        message:
                                            "Cart update failed",
                                        error:
                                            err.message
                                    });
                                }

                                return res.status(
                                    200
                                ).json({
                                    message:
                                        "Product quantity updated in cart",

                                    price:
                                        finalPrice,

                                    quantity:
                                        newQuantity,

                                    total_price:
                                        Number(
                                            (
                                                finalPrice *
                                                newQuantity
                                            ).toFixed(2)
                                        )
                                });
                            }
                        );

                    }

                    // =================================================
                    // ADD NEW PRODUCT TO CART
                    // =================================================

                    else {

                        const insertSql = `
                            INSERT INTO cart
                            (
                                user_id,
                                product_id,
                                quantity
                            )
                            VALUES (?, ?, ?)
                        `;

                        db.query(
                            insertSql,
                            [
                                userId,
                                product_id,
                                qty
                            ],
                            (err, result) => {

                                if (err) {
                                    return res.status(
                                        500
                                    ).json({
                                        message:
                                            "Failed to add product to cart",
                                        error:
                                            err.message
                                    });
                                }

                                return res.status(
                                    201
                                ).json({
                                    message:
                                        "Product added to cart",

                                    cartId:
                                        result.insertId,

                                    price:
                                        finalPrice,

                                    quantity:
                                        qty,

                                    total_price:
                                        Number(
                                            (
                                                finalPrice *
                                                qty
                                            ).toFixed(2)
                                        )
                                });
                            }
                        );
                    }
                }
            );
        }
    );
};


// =====================================================
// GET MY CART
// =====================================================

const getCart = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            c.id,
            c.product_id,

            p.name AS product_name,

            p.price AS regular_price,

            p.mrp,

            p.discount_percent,

            p.deal_type,

            p.deal_title,

            p.offer_text,

            p.coupon_code,

            p.deal_active,

            p.image_url,

            p.stock,

            c.quantity,

            CASE
                WHEN p.deal_type = 'current'
                AND p.discount_percent > 0
                AND p.discount_percent <= 100
                THEN
                    ROUND(
                        p.price -
                        (
                            p.price *
                            p.discount_percent /
                            100
                        ),
                        2
                    )

                ELSE p.price
            END AS price,

            CASE
                WHEN p.deal_type = 'current'
                AND p.discount_percent > 0
                AND p.discount_percent <= 100
                THEN
                    ROUND(
                        (
                            p.price -
                            (
                                p.price *
                                p.discount_percent /
                                100
                            )
                        ) * c.quantity,
                        2
                    )

                ELSE
                    ROUND(
                        p.price * c.quantity,
                        2
                    )

            END AS total_price

        FROM cart c

        JOIN products p
            ON c.product_id = p.id

        WHERE c.user_id = ?

        ORDER BY c.id DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Failed to fetch cart",

                    error:
                        err.message
                });
            }

            res.status(200).json({
                message:
                    "Cart fetched successfully",

                cart:
                    results
            });
        }
    );
};


// =====================================================
// UPDATE CART QUANTITY
// =====================================================

const updateCartQuantity = (
    req,
    res
) => {

    const userId = req.user.id;

    const {
        id
    } = req.params;

    const {
        quantity
    } = req.body;

    const qty = Number(quantity);

    if (
        !Number.isInteger(qty) ||
        qty < 1
    ) {
        return res.status(400).json({
            message:
                "Quantity must be at least 1"
        });
    }

    // =================================================
    // GET CART ITEM + PRODUCT STOCK + DEAL
    // =================================================

    const checkSql = `
        SELECT
            c.id,
            c.product_id,

            p.name,
            p.price,
            p.stock,

            p.deal_type,
            p.discount_percent

        FROM cart c

        JOIN products p
            ON c.product_id = p.id

        WHERE c.id = ?
        AND c.user_id = ?
    `;

    db.query(
        checkSql,
        [
            id,
            userId
        ],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Database error",

                    error:
                        err.message
                });
            }

            if (
                results.length === 0
            ) {
                return res.status(404).json({
                    message:
                        "Cart item not found"
                });
            }

            const item =
                results[0];

            const stock =
                Number(
                    item.stock
                );

            // =================================================
            // STOCK CHECK
            // =================================================

            if (stock <= 0) {
                return res.status(400).json({
                    message:
                        `${item.name} is out of stock`
                });
            }

            if (qty > stock) {
                return res.status(400).json({
                    message:
                        `Only ${stock} ${item.name} available in stock`
                });
            }

            // =================================================
            // UPDATE QUANTITY
            // =================================================

            const updateSql = `
                UPDATE cart

                SET quantity = ?

                WHERE id = ?

                AND user_id = ?
            `;

            db.query(
                updateSql,
                [
                    qty,
                    id,
                    userId
                ],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            message:
                                "Cart update failed",

                            error:
                                err.message
                        });
                    }

                    if (
                        result.affectedRows === 0
                    ) {
                        return res.status(404).json({
                            message:
                                "Cart item not found"
                        });
                    }

                    // =================================================
                    // CALCULATE CURRENT PRICE
                    // =================================================

                    const finalPrice =
                        calculateFinalPrice(
                            item
                        );

                    const totalPrice =
                        Number(
                            (
                                finalPrice *
                                qty
                            ).toFixed(2)
                        );

                    res.status(200).json({
                        message:
                            "Cart quantity updated successfully",

                        price:
                            finalPrice,

                        quantity:
                            qty,

                        total_price:
                            totalPrice
                    });
                }
            );
        }
    );
};


// =====================================================
// REMOVE PRODUCT FROM CART
// =====================================================

const removeFromCart = (
    req,
    res
) => {

    const userId =
        req.user.id;

    const {
        id
    } = req.params;

    const sql = `
        DELETE FROM cart

        WHERE id = ?

        AND user_id = ?
    `;

    db.query(
        sql,
        [
            id,
            userId
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message:
                        "Failed to remove product from cart",

                    error:
                        err.message
                });
            }

            if (
                result.affectedRows === 0
            ) {
                return res.status(404).json({
                    message:
                        "Cart item not found"
                });
            }

            res.status(200).json({
                message:
                    "Product removed from cart successfully"
            });
        }
    );
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
};

