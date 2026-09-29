import { useEffect, useState } from "react";
import API from "../api/api";

function AdminDeals() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingDeal, setEditingDeal] = useState(null);

    const emptyForm = {
        mrp: "",
        discount_percent: 0,
        deal_type: "current",
        deal_title: "",
        offer_text: "",
        coupon_code: "",
        deal_stock: "",
        deal_start_at: "",
        deal_end_at: "",
        deal_active: false
    };

    const [form, setForm] = useState(emptyForm);

    // =========================
    // FETCH DEALS
    // =========================

    const fetchDeals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/deals");

            setDeals(response.data.deals || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load deals"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    // =========================
    // EDIT DEAL
    // =========================

    const handleEdit = (deal) => {
        setSuccess("");
        setError("");

        setEditingDeal(deal);

        setForm({
            mrp: deal.mrp ?? "",
            discount_percent:
                deal.discount_percent ?? 0,

            deal_type:
                deal.deal_type || "current",

            deal_title:
                deal.deal_title || "",

            offer_text:
                deal.offer_text || "",

            coupon_code:
                deal.coupon_code || "",

            deal_stock:
                deal.deal_stock ?? "",

            deal_start_at:
                deal.deal_start_at
                    ? formatDateTimeForInput(
                          deal.deal_start_at
                      )
                    : "",

            deal_end_at:
                deal.deal_end_at
                    ? formatDateTimeForInput(
                          deal.deal_end_at
                      )
                    : "",

            deal_active:
                Boolean(deal.deal_active)
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =========================
    // DATE FORMAT
    // =========================

    const formatDateTimeForInput = (value) => {
        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const hours = String(
            date.getHours()
        ).padStart(2, "0");

        const minutes = String(
            date.getMinutes()
        ).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (event) => {
        const { name, value, type, checked } =
            event.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };

    // =========================
    // SAVE DEAL
    // =========================

    const handleSave = async (event) => {
        event.preventDefault();

        if (!editingDeal) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await API.put(
                `/deals/${editingDeal.id}`,
                {
                    mrp:
                        form.mrp === ""
                            ? null
                            : Number(form.mrp),

                    discount_percent:
                        form.discount_percent === ""
                            ? 0
                            : Number(
                                  form.discount_percent
                              ),

                    deal_type:
                        form.deal_type,

                    deal_title:
                        form.deal_title,

                    offer_text:
                        form.offer_text,

                    coupon_code:
                        form.coupon_code,

                    deal_stock:
                        form.deal_stock === ""
                            ? null
                            : Number(
                                  form.deal_stock
                              ),

                    deal_start_at:
                        form.deal_start_at || null,

                    deal_end_at:
                        form.deal_end_at || null,

                    deal_active:
                        form.deal_active
                }
            );

            setSuccess(
                "Deal updated successfully!"
            );

            setEditingDeal(null);
            setForm(emptyForm);

            await fetchDeals();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update deal"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancel = () => {
        setEditingDeal(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
    };

    // =========================
    // DEAL TYPE LABEL
    // =========================

    const getDealTypeLabel = (type) => {
        if (type === "featured") {
            return "⭐ FEATURED";
        }

        if (type === "current") {
            return "🏷️ CURRENT DEAL";
        }

        return "DEAL";
    };

    // =========================
    // DISCOUNT
    // =========================

    const calculateDiscount = (deal) => {
        if (
            deal.mrp &&
            deal.price &&
            Number(deal.mrp) > Number(deal.price)
        ) {
            return Math.round(
                ((Number(deal.mrp) -
                    Number(deal.price)) /
                    Number(deal.mrp)) *
                    100
            );
        }

        return Number(
            deal.discount_percent || 0
        );
    };

    return (
        <div className="admin-deals-page">

            <div className="admin-deals-header">
                <div>
                    <h1>🏷️ Deals Management</h1>

                    <p>
                        Manage current and featured
                        product deals
                    </p>
                </div>

                <button
                    className="admin-deals-refresh"
                    onClick={fetchDeals}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* SUCCESS */}

            {success && (
                <div className="admin-deals-success">
                    ✅ {success}
                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="admin-deals-error">
                    ⚠️ {error}
                </div>
            )}

            {/* =========================
                EDITOR
            ========================= */}

            {editingDeal && (
                <section className="deal-editor">

                    <div className="deal-editor-header">

                        <div>
                            <h2>
                                Edit Deal
                            </h2>

                            <p>
                                {editingDeal.name}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="deal-cancel-btn"
                            onClick={
                                handleCancel
                            }
                        >
                            ✕ Cancel
                        </button>

                    </div>

                    <form
                        onSubmit={handleSave}
                        className="deal-form"
                    >

                        <div className="deal-form-grid">

                            {/* DEAL TYPE */}

                            <div className="deal-field">
                                <label>
                                    Deal Type
                                </label>

                                <select
                                    name="deal_type"
                                    value={
                                        form.deal_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    <option value="current">
                                        Current Deal
                                    </option>

                                    <option value="featured">
                                        Featured Deal
                                    </option>

                                    <option value="none">
                                        None
                                    </option>
                                </select>
                            </div>

                            {/* MRP */}

                            <div className="deal-field">
                                <label>
                                    MRP
                                </label>

                                <input
                                    type="number"
                                    name="mrp"
                                    value={form.mrp}
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    placeholder="50000"
                                />
                            </div>

                            {/* DISCOUNT */}

                            <div className="deal-field">
                                <label>
                                    Discount %
                                </label>

                                <input
                                    type="number"
                                    name="discount_percent"
                                    value={
                                        form.discount_percent
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </div>

                            {/* DEAL STOCK */}

                            <div className="deal-field">
                                <label>
                                    Deal Stock
                                </label>

                                <input
                                    type="number"
                                    name="deal_stock"
                                    value={
                                        form.deal_stock
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    placeholder="25"
                                />
                            </div>

                            {/* DEAL TITLE */}

                            <div className="deal-field deal-field-full">
                                <label>
                                    Deal Title
                                </label>

                                <input
                                    type="text"
                                    name="deal_title"
                                    value={
                                        form.deal_title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={150}
                                    placeholder="Mega Electronics Sale"
                                />
                            </div>

                            {/* OFFER TEXT */}

                            <div className="deal-field deal-field-full">
                                <label>
                                    Offer Text
                                </label>

                                <textarea
                                    name="offer_text"
                                    value={
                                        form.offer_text
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={255}
                                    rows="3"
                                    placeholder="Get 20% OFF on selected products"
                                />
                            </div>

                            {/* COUPON */}

                            <div className="deal-field">
                                <label>
                                    Coupon Code
                                </label>

                                <input
                                    type="text"
                                    name="coupon_code"
                                    value={
                                        form.coupon_code
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={50}
                                    placeholder="MEGA20"
                                />
                            </div>

                            {/* START */}

                            <div className="deal-field">
                                <label>
                                    Deal Starts
                                </label>

                                <input
                                    type="datetime-local"
                                    name="deal_start_at"
                                    value={
                                        form.deal_start_at
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            {/* END */}

                            <div className="deal-field">
                                <label>
                                    Deal Ends
                                </label>

                                <input
                                    type="datetime-local"
                                    name="deal_end_at"
                                    value={
                                        form.deal_end_at
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            {/* ACTIVE */}

                            <div className="deal-field deal-active-field">

                                <label className="deal-checkbox">

                                    <input
                                        type="checkbox"
                                        name="deal_active"
                                        checked={
                                            form.deal_active
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        Deal Active
                                    </span>

                                </label>

                            </div>

                        </div>

                        <div className="deal-form-actions">

                            <button
                                type="button"
                                className="deal-cancel-btn"
                                onClick={
                                    handleCancel
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="deal-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "💾 Save Deal"}
                            </button>

                        </div>

                    </form>
                </section>
            )}

            {/* =========================
                DEALS
            ========================= */}

            {loading ? (
                <div className="admin-deals-loading">
                    Loading deals...
                </div>
            ) : deals.length === 0 ? (
                <div className="admin-deals-empty">
                    <div>🏷️</div>

                    <h2>
                        No Deals Found
                    </h2>

                    <p>
                        Select Current Deal or
                        Featured Deal from Product
                        Management first.
                    </p>
                </div>
            ) : (
                <div className="admin-deals-grid">

                    {deals.map((deal) => {

                        const discount =
                            calculateDiscount(
                                deal
                            );

                        return (
                            <div
                                className="admin-deal-card"
                                key={deal.id}
                            >

                                {/* IMAGE */}

                                <div className="admin-deal-image">

                                    <img
                                        src={
                                            deal.image_url ||
                                            "https://placehold.co/600x600/png?text=No+Image"
                                        }
                                        alt={
                                            deal.name
                                        }
                                        onError={(
                                            event
                                        ) => {
                                            event.currentTarget.onerror =
                                                null;

                                            event.currentTarget.src =
                                                "https://placehold.co/600x600/png?text=No+Image";
                                        }}
                                    />

                                    <span
                                        className={
                                            deal.deal_type ===
                                            "featured"
                                                ? "admin-deal-badge featured"
                                                : "admin-deal-badge current"
                                        }
                                    >
                                        {getDealTypeLabel(
                                            deal.deal_type
                                        )}
                                    </span>

                                </div>

                                {/* BODY */}

                                <div className="admin-deal-body">

                                    <span className="admin-deal-category">
                                        {deal.category_name ||
                                            "Product"}
                                    </span>

                                    <h3>
                                        {deal.name}
                                    </h3>

                                    {deal.deal_title && (
                                        <strong className="admin-deal-title">
                                            {deal.deal_title}
                                        </strong>
                                    )}

                                    <div className="admin-deal-prices">

                                        {deal.mrp && (
                                            <span className="admin-deal-mrp">
                                                ₹
                                                {Number(
                                                    deal.mrp
                                                ).toFixed(
                                                    0
                                                )}
                                            </span>
                                        )}

                                        <span className="admin-deal-price">
                                            ₹
                                            {Number(
                                                deal.price
                                            ).toFixed(
                                                0
                                            )}
                                        </span>

                                        {discount > 0 && (
                                            <span className="admin-deal-discount">
                                                {discount}% OFF
                                            </span>
                                        )}

                                    </div>

                                    {deal.offer_text && (
                                        <p className="admin-deal-offer">
                                            {deal.offer_text}
                                        </p>
                                    )}

                                    {deal.coupon_code && (
                                        <div className="admin-deal-coupon">
                                            🎟️
                                            <span>
                                                {
                                                    deal.coupon_code
                                                }
                                            </span>
                                        </div>
                                    )}

                                    <div className="admin-deal-info">

                                        <span>
                                            📦 Deal Stock:{" "}
                                            {deal.deal_stock ??
                                                "—"}
                                        </span>

                                        <span>
                                            {deal.deal_active
                                                ? "🟢 Active"
                                                : "🔴 Inactive"}
                                        </span>

                                    </div>

                                    <button
                                        className="admin-deal-edit-btn"
                                        onClick={() =>
                                            handleEdit(
                                                deal
                                            )
                                        }
                                    >
                                        ✏️ Edit Deal
                                    </button>

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default AdminDeals;