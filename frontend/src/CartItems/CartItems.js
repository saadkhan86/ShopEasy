import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import styles from "./CartItems.module.css";

const CartItems = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    totalItems: 0,
    uniqueItems: 0,
  });

  const [pendingUpdate, setPendingUpdate] = useState({
    show: false,
    productId: null,
    productName: "",
    type: "", // 'increase' or 'decrease'
    currentQuantity: 0,
    newQuantity: 0,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: "", // 'remove' or 'clear'
    title: "",
    message: "",
    productId: null,
    productName: "",
  });

  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api";

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        showAlert(
          "warning",
          "Please login to view your cart",
          "Login Required"
        );
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      if (data.success) {
        setCartItems(data.cart || []);
        calculateCartSummary(data.cart || []);
      }
    } catch (error) {
      setError(error.message);
      showAlert("failure", error.message, "Cart Error");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart summary
  const calculateCartSummary = (items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.productId?.price || 0) * item.quantity;
    }, 0);

    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;

    setCartSummary({
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueItems: items.length,
    });
  };

  // Handle +/- button click
  const handleQuantityButtonClick = (item, type) => {
    const newQuantity =
      type === "increase" ? item.quantity + 1 : item.quantity - 1;

    // Basic validations
    if (newQuantity < 1) {
      showAlert(
        "warning",
        "Quantity cannot be less than 1",
        "Invalid Quantity"
      );
      return;
    }

    if (newQuantity > (item.productId?.stock || 99)) {
      showAlert(
        "warning",
        `Only ${item.productId?.stock || 0} items available in stock`,
        "Stock Limited"
      );
      return;
    }

    // Show small confirm button
    setPendingUpdate({
      show: true,
      productId: item.productId._id,
      productName: item.productId?.title || "Product",
      type,
      currentQuantity: item.quantity,
      newQuantity,
    });
  };

  // Confirm and update quantity
  const confirmUpdateQuantity = async () => {
    try {
      const { productId, newQuantity } = pendingUpdate;

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update quantity");
      }

      if (data.success) {
        showAlert(
          "success",
          `Quantity ${
            pendingUpdate.type === "increase" ? "increased" : "decreased"
          } to ${newQuantity}`,
          "Cart Updated"
        );
        fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      showAlert("failure", error.message, "Update Failed");
    } finally {
      // Hide confirm button
      setPendingUpdate({
        show: false,
        productId: null,
        productName: "",
        type: "",
        currentQuantity: 0,
        newQuantity: 0,
      });
    }
  };

  // Cancel update
  const cancelUpdateQuantity = () => {
    setPendingUpdate({
      show: false,
      productId: null,
      productName: "",
      type: "",
      currentQuantity: 0,
      newQuantity: 0,
    });
  };

  // Show remove confirmation dialog
  const showRemoveConfirm = (productId, productName) => {
    setConfirmDialog({
      show: true,
      type: "remove",
      title: "Remove Item",
      message: `Are you sure you want to remove "${productName}" from your cart?`,
      productId,
      productName,
    });
  };

  // Show clear cart confirmation dialog
  const showClearCartConfirm = () => {
    if (cartItems.length === 0) {
      showAlert("info", "Your cart is already empty", "Empty Cart");
      return;
    }

    setConfirmDialog({
      show: true,
      type: "clear",
      title: "Clear Cart",
      message:
        "Are you sure you want to remove all items from your cart? This action cannot be undone.",
      productId: null,
      productName: "",
    });
  };

  // Confirm remove item
  const confirmRemoveItem = async () => {
    try {
      const { productId } = confirmDialog;

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      if (data.success) {
        showAlert("success", "Item removed from cart", "Cart Updated");
        fetchCartItems(); // Refresh cart
      }
    } catch (error) {
      showAlert("failure", error.message, "Remove Failed");
    } finally {
      closeConfirmDialog();
    }
  };

  // Confirm clear cart
  const confirmClearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to clear cart");
      }

      if (data.success) {
        showAlert("success", "Cart cleared successfully", "Cart Cleared");
        setCartItems([]);
        calculateCartSummary([]);
      }
    } catch (error) {
      showAlert("failure", error.message, "Clear Failed");
    } finally {
      closeConfirmDialog();
    }
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      show: false,
      type: "",
      title: "",
      message: "",
      productId: null,
      productName: "",
    });
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showAlert("warning", "Your cart is empty", "Empty Cart");
      return;
    }

    localStorage.setItem(
      "checkoutCart",
      JSON.stringify({
        items: cartItems,
        summary: cartSummary,
      })
    );

    navigate("/checkout");
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/");
  };

  // Initialize
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Format price
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Unable to Load Cart</h2>
        <p>{error}</p>
        <button onClick={fetchCartItems} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation Dialog for Remove/Clear */}
      {confirmDialog.show && (
        <div className={styles.confirmDialogOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.dialogHeader}>
              <h3>{confirmDialog.title}</h3>
              <button
                onClick={closeConfirmDialog}
                className={styles.dialogClose}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className={styles.dialogContent}>
              <p>{confirmDialog.message}</p>

              {confirmDialog.type === "remove" && (
                <div className={styles.warningBox}>
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  <span>
                    This item will be permanently removed from your cart.
                  </span>
                </div>
              )}

              {confirmDialog.type === "clear" && (
                <div className={styles.warningBox}>
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  <span>
                    All {cartItems.length} items will be removed from your cart.
                  </span>
                </div>
              )}
            </div>

            <div className={styles.dialogActions}>
              <button
                onClick={closeConfirmDialog}
                className={styles.cancelButton}
              >
                <i className="fa-solid fa-times"></i> Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.type === "remove") {
                    confirmRemoveItem();
                  } else if (confirmDialog.type === "clear") {
                    confirmClearCart();
                  }
                }}
                className={`${styles.confirmButton} ${
                  confirmDialog.type === "clear" ? styles.dangerButton : ""
                }`}
              >
                {confirmDialog.type === "clear" ? (
                  <>
                    <i className="fa-solid fa-trash"></i> Clear All
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i> Remove Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className={"fa-brands fa-opencart"}></i> Your Shopping Cart
          </h1>
          <div className={styles.cartStats}>
            <span className={styles.itemCount}>
              {cartSummary.totalItems} item
              {cartSummary.totalItems !== 1 ? "s" : ""}
            </span>
            <span className={styles.uniqueCount}>
              {cartSummary.uniqueItems} unique product
              {cartSummary.uniqueItems !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some amazing products to get started!</p>
            <button onClick={continueShopping} className={styles.shopButton}>
              <i className="fa-solid fa-store"></i> Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.cartContent}>
              {/* Cart Items List */}
              <div className={styles.itemsSection}>
                <div className={styles.itemsHeader}>
                  <h2>Products</h2>
                  <button
                    onClick={showClearCartConfirm}
                    className={styles.clearButton}
                  >
                    <i className="fa-solid fa-trash"></i> Clear Cart
                  </button>
                </div>

                <div className={styles.itemsList}>
                  {cartItems.map((item) => (
                    <div key={item._id} className={styles.cartItem}>
                      <div
                        className={styles.itemImage}
                        onClick={() =>
                          navigate(`/product/${item.productId._id}`)
                        }
                      >
                        <img
                          src={
                            item.productId?.image ||
                            "https://via.placeholder.com/150"
                          }
                          alt={item.productId?.title}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150?text=No+Image";
                          }}
                        />
                      </div>

                      <div className={styles.itemDetails}>
                        <h3 className={styles.productTitle}>
                          <Link to={`/product/${item.productId?._id}`}>
                            {item.productId?.title}
                          </Link>
                        </h3>

                        <div className={styles.productMeta}>
                          <span className={styles.category}>
                            {item.productId?.category}
                          </span>
                          {item.productId?.brand && (
                            <span className={styles.brand}>
                              {item.productId.brand}
                            </span>
                          )}
                        </div>

                        <div className={styles.priceSection}>
                          <span className={styles.itemPrice}>
                            {formatPrice(item.productId?.price || 0)}
                          </span>
                          <span className={styles.itemTotal}>
                            Total:{" "}
                            {formatPrice(
                              (item.productId?.price || 0) * item.quantity
                            )}
                          </span>
                        </div>

                        {item.productId?.stock < 10 && (
                          <div className={styles.lowStock}>
                            ⚠️ Only {item.productId.stock} left in stock
                          </div>
                        )}
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.quantityControl}>
                          <button
                            className={styles.quantityBtn}
                            onClick={() =>
                              handleQuantityButtonClick(item, "decrease")
                            }
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className={styles.quantityDisplay}>
                            {item.quantity}
                          </span>
                          <button
                            className={styles.quantityBtn}
                            onClick={() =>
                              handleQuantityButtonClick(item, "increase")
                            }
                            disabled={
                              item.quantity >= (item.productId?.stock || 0)
                            }
                          >
                            +
                          </button>
                        </div>

                        {/* Small Confirm Button (only shows for this item) */}
                        {pendingUpdate.show &&
                          pendingUpdate.productId === item.productId._id && (
                            <div className={styles.confirmMiniBox}>
                              <span className={styles.confirmText}>
                                Update to {pendingUpdate.newQuantity}?
                              </span>
                              <div className={styles.confirmMiniButtons}>
                                <button
                                  onClick={cancelUpdateQuantity}
                                  className={styles.confirmMiniCancel}
                                >
                                  <i className="fa-solid fa-times"></i>
                                </button>
                                <button
                                  onClick={confirmUpdateQuantity}
                                  className={styles.confirmMiniOk}
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              </div>
                            </div>
                          )}

                        <button
                          onClick={() =>
                            showRemoveConfirm(
                              item.productId._id,
                              item.productId?.title
                            )
                          }
                          className={styles.removeButton}
                        >
                          <i className="fa-solid fa-trash"></i> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className={styles.summarySection}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryTitle}>
                    <i className="fa-solid fa-receipt"></i> Order Summary
                  </h2>

                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSummary.subtotal)}</span>
                    </div>

                    <div className={styles.summaryRow}>
                      <span>Shipping</span>
                      <span>
                        {parseFloat(cartSummary.shipping) === 0
                          ? "FREE"
                          : formatPrice(cartSummary.shipping)}
                      </span>
                    </div>

                    <div className={styles.summaryRow}>
                      <span>Tax (18% GST)</span>
                      <span>{formatPrice(cartSummary.tax)}</span>
                    </div>

                    <div className={styles.summaryDivider}></div>

                    <div className={styles.summaryTotal}>
                      <span>Total Amount</span>
                      <span className={styles.totalAmount}>
                        {formatPrice(cartSummary.total)}
                      </span>
                    </div>

                    {parseFloat(cartSummary.shipping) === 0 ? (
                      <div className={styles.freeShipping}>
                        🎉 You've earned FREE shipping!
                      </div>
                    ) : (
                      <div className={styles.shippingNote}>
                        Add ₹
                        {(500 - parseFloat(cartSummary.subtotal)).toFixed(2)}{" "}
                        more for FREE shipping
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    className={styles.checkoutButton}
                  >
                    <i className="fa-solid fa-lock"></i> Proceed to Checkout
                  </button>

                  <button
                    onClick={continueShopping}
                    className={styles.continueButton}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Continue Shopping
                  </button>

                  <div className={styles.paymentMethods}>
                    <p>Secure Payment</p>
                    <div className={styles.paymentIcons}>
                      <i className="fa-brands fa-cc-visa"></i>
                      <i className="fa-brands fa-cc-mastercard"></i>
                      <i className="fa-brands fa-cc-paypal"></i>
                      <i className="fa-solid fa-university"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartItems;
