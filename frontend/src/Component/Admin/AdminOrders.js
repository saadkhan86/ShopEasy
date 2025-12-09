import React, { useState, useEffect } from "react";
import { useAlert } from "../Context/AlertContext";
import styles from "./AdminOrders.module.css";
import AdminSidebar from "./AdminSidebar";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusForm, setStatusForm] = useState({
    status: "",
    trackingNumber: "",
    notes: "",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state

  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchOrders();

    // Set initial sidebar state based on screen size
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, orders, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || data.data || []);
        setFilteredOrders(data.orders || data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        switch (dateFilter) {
          case "today":
            return orderDate >= today;
          case "yesterday":
            return orderDate >= yesterday && orderDate < today;
          case "week":
            return orderDate >= weekAgo;
          case "month":
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order._id?.includes(searchTerm) ||
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status || "",
      trackingNumber: order.trackingNumber || "",
      notes: order.adminNotes || "",
    });
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!selectedOrder) return;

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusForm),
        }
      );

      const data = await response.json();
      if (data.success) {
        showAlert("success", "Order status updated successfully", "Success");
        setShowOrderModal(false);
        fetchOrders(); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    }
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          text: "Pending",
          class: styles.statusPending,
          icon: "fa-clock",
        };
      case "processing":
        return {
          text: "Processing",
          class: styles.statusProcessing,
          icon: "fa-cog",
        };
      case "shipped":
        return {
          text: "Shipped",
          class: styles.statusShipped,
          icon: "fa-shipping-fast",
        };
      case "delivered":
        return {
          text: "Delivered",
          class: styles.statusDelivered,
          icon: "fa-check-circle",
        };
      case "cancelled":
        return {
          text: "Cancelled",
          class: styles.statusCancelled,
          icon: "fa-times-circle",
        };
      case "refunded":
        return {
          text: "Refunded",
          class: styles.statusRefunded,
          icon: "fa-money-bill-wave",
        };
      default:
        return {
          text: "Pending",
          class: styles.statusPending,
          icon: "fa-clock",
        };
    }
  };

  const getPaymentBadge = (method) => {
    switch (method?.toLowerCase()) {
      case "credit_card":
        return {
          text: "Credit Card",
          class: styles.paymentCredit,
          icon: "fa-credit-card",
        };
      case "paypal":
        return {
          text: "PayPal",
          class: styles.paymentPaypal,
          icon: "fa-paypal",
        };
      case "cash":
        return {
          text: "Cash",
          class: styles.paymentCash,
          icon: "fa-money-bill",
        };
      case "bank_transfer":
        return {
          text: "Bank Transfer",
          class: styles.paymentBank,
          icon: "fa-university",
        };
      default:
        return {
          text: method || "Unknown",
          class: styles.paymentOther,
          icon: "fa-wallet",
        };
    }
  };

  const calculateOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return { total, pending, processing, shipped, delivered, revenue };
  };

  const stats = calculateOrderStats();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <i className="fa-solid fa-shopping-cart fa-spin"></i>
        </div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Floating Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          className={styles.sidebarToggleButton}
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          title="Open Sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      )}

      {/* Mobile Burger Button */}
      <button
        className={`${styles.burgerButton} ${
          isSidebarOpen ? styles.open : ""
        } ${!isSidebarOpen ? styles.hidden : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && window.innerWidth <= 992 && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      <div
        className={`${styles.mainContent} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className="fa-solid fa-shopping-cart"></i> Orders Management
          </h1>
          <p className={styles.subtitle}>
            Manage customer orders and track order status
          </p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchTerm("")}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>

          <div className={styles.controlButtons}>
            <button className={styles.refreshButton} onClick={fetchOrders}>
              <i className="fa-solid fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter">
              <i className="fa-solid fa-filter"></i> Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="dateFilter">
              <i className="fa-solid fa-calendar"></i> Filter by Date
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.clearFilters}
              onClick={() => {
                setStatusFilter("all");
                setDateFilter("all");
                setSearchTerm("");
              }}
            >
              <i className="fa-solid fa-times"></i> Clear Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(0, 123, 255, 0.2)" }}
            >
              <i
                className="fa-solid fa-shopping-cart"
                style={{ color: "#007bff" }}
              ></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(255, 193, 7, 0.2)" }}
            >
              <i className="fa-solid fa-clock" style={{ color: "#ffc107" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.pending}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(40, 167, 69, 0.2)" }}
            >
              <i
                className="fa-solid fa-check-circle"
                style={{ color: "#28a745" }}
              ></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.delivered}</span>
              <span className={styles.statLabel}>Delivered</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(111, 66, 193, 0.2)" }}
            >
              <i
                className="fa-solid fa-money-bill-wave"
                style={{ color: "#6f42c1" }}
              ></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {formatCurrency(stats.revenue)}
              </span>
              <span className={styles.statLabel}>Revenue</span>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.tableRow}>
              <div className={`${styles.tableCell} ${styles.cellOrder}`}>
                Order
              </div>
              <div className={`${styles.tableCell} ${styles.cellCustomer}`}>
                Customer
              </div>
              <div className={`${styles.tableCell} ${styles.cellDate}`}>
                Date
              </div>
              <div className={`${styles.tableCell} ${styles.cellAmount}`}>
                Amount
              </div>
              <div className={`${styles.tableCell} ${styles.cellPayment}`}>
                Payment
              </div>
              <div className={`${styles.tableCell} ${styles.cellStatus}`}>
                Status
              </div>
              <div className={`${styles.tableCell} ${styles.cellActions}`}>
                Actions
              </div>
            </div>
          </div>

          <div className={styles.tableBody}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const status = getStatusBadge(order.status);
                const payment = getPaymentBadge(order.paymentMethod);
                return (
                  <div key={order._id} className={styles.tableRow}>
                    <div className={`${styles.tableCell} ${styles.cellOrder}`}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderNumber}>
                          #
                          {order.orderNumber ||
                            order._id?.slice(-8).toUpperCase()}
                        </div>
                        <div className={styles.orderId}>
                          ID: {order._id?.slice(-6)}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${styles.tableCell} ${styles.cellCustomer}`}
                    >
                      <div className={styles.customerInfo}>
                        <div className={styles.customerName}>
                          {order.customerName || order.user?.name || "N/A"}
                        </div>
                        <div className={styles.customerEmail}>
                          {order.customerEmail || order.user?.email || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.tableCell} ${styles.cellDate}`}>
                      {formatDate(order.createdAt || order.orderDate)}
                    </div>

                    <div className={`${styles.tableCell} ${styles.cellAmount}`}>
                      <span className={styles.orderAmount}>
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                    </div>

                    <div
                      className={`${styles.tableCell} ${styles.cellPayment}`}
                    >
                      <span
                        className={`${styles.paymentBadge} ${payment.class}`}
                      >
                        <i className={`fa-solid ${payment.icon}`}></i>{" "}
                        {payment.text}
                      </span>
                    </div>

                    <div className={`${styles.tableCell} ${styles.cellStatus}`}>
                      <span className={`${styles.statusBadge} ${status.class}`}>
                        <i className={`fa-solid ${status.icon}`}></i>{" "}
                        {status.text}
                      </span>
                    </div>

                    <div
                      className={`${styles.tableCell} ${styles.cellActions}`}
                    >
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.viewButton}
                          onClick={() => handleViewOrder(order)}
                          title="View Details"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => handleViewOrder(order)}
                          title="Update Status"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noData}>
                <i className="fa-solid fa-shopping-basket"></i>
                <p>No orders found</p>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  dateFilter !== "all") && <p>Try clearing your filters</p>}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button className={styles.pageButton} disabled>
            <i className="fa-solid fa-chevron-left"></i> Previous
          </button>
          <span className={styles.pageInfo}>
            Showing 1-{filteredOrders.length} of {orders.length} orders
          </span>
          <button className={styles.pageButton}>
            Next <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Order Modal */}
        {showOrderModal && selectedOrder && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowOrderModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  <i className="fa-solid fa-receipt"></i>
                  Order #
                  {selectedOrder.orderNumber ||
                    selectedOrder._id?.slice(-8).toUpperCase()}
                </h3>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowOrderModal(false)}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.orderDetails}>
                  {/* Order Summary */}
                  <div className={styles.orderSummary}>
                    <div className={styles.summaryItem}>
                      <strong>Order Date:</strong>
                      <span>
                        {formatDate(
                          selectedOrder.createdAt || selectedOrder.orderDate
                        )}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <strong>Customer:</strong>
                      <span>
                        {selectedOrder.customerName ||
                          selectedOrder.user?.name ||
                          "N/A"}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <strong>Email:</strong>
                      <span>
                        {selectedOrder.customerEmail ||
                          selectedOrder.user?.email ||
                          "N/A"}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <strong>Contact:</strong>
                      <span>
                        {selectedOrder.contactNumber ||
                          selectedOrder.user?.contact ||
                          "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={styles.orderItems}>
                    <h4>
                      <i className="fa-solid fa-list"></i> Order Items
                      <span className={styles.itemsCount}>
                        ({selectedOrder.items?.length || 0} items)
                      </span>
                    </h4>

                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className={styles.itemsList}>
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className={styles.itemRow}>
                            <div className={styles.itemImage}>
                              {item.image ? (
                                <img src={item.image} alt={item.name} />
                              ) : (
                                <div className={styles.itemNoImage}>
                                  <i className="fa-solid fa-box"></i>
                                </div>
                              )}
                            </div>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemName}>{item.name}</div>
                              <div className={styles.itemMeta}>
                                <span>Qty: {item.quantity}</span>
                                <span>Price: {formatCurrency(item.price)}</span>
                                <span>
                                  Total:{" "}
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noItems}>
                        <i className="fa-solid fa-box-open"></i>
                        <p>No items in this order</p>
                      </div>
                    )}

                    {/* Order Totals */}
                    <div className={styles.orderTotals}>
                      <div className={styles.totalRow}>
                        <span>Subtotal:</span>
                        <span>
                          {formatCurrency(
                            selectedOrder.subtotal ||
                              selectedOrder.totalAmount ||
                              0
                          )}
                        </span>
                      </div>
                      <div className={styles.totalRow}>
                        <span>Shipping:</span>
                        <span>
                          {formatCurrency(selectedOrder.shippingFee || 0)}
                        </span>
                      </div>
                      <div className={styles.totalRow}>
                        <span>Tax:</span>
                        <span>
                          {formatCurrency(selectedOrder.taxAmount || 0)}
                        </span>
                      </div>
                      <div className={styles.totalRow}>
                        <span>Discount:</span>
                        <span className={styles.discount}>
                          -{formatCurrency(selectedOrder.discount || 0)}
                        </span>
                      </div>
                      <div className={styles.totalRow}>
                        <strong>Total Amount:</strong>
                        <strong className={styles.grandTotal}>
                          {formatCurrency(selectedOrder.totalAmount || 0)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className={styles.shippingInfo}>
                    <h4>
                      <i className="fa-solid fa-truck"></i> Shipping Information
                    </h4>
                    <div className={styles.shippingDetails}>
                      <div className={styles.shippingRow}>
                        <strong>Address:</strong>
                        <span>
                          {selectedOrder.shippingAddress?.address || "N/A"}
                        </span>
                      </div>
                      <div className={styles.shippingRow}>
                        <strong>City:</strong>
                        <span>
                          {selectedOrder.shippingAddress?.city || "N/A"}
                        </span>
                      </div>
                      <div className={styles.shippingRow}>
                        <strong>Country:</strong>
                        <span>
                          {selectedOrder.shippingAddress?.country || "N/A"}
                        </span>
                      </div>
                      <div className={styles.shippingRow}>
                        <strong>Postal Code:</strong>
                        <span>
                          {selectedOrder.shippingAddress?.postalCode || "N/A"}
                        </span>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className={styles.shippingRow}>
                          <strong>Tracking Number:</strong>
                          <span className={styles.trackingNumber}>
                            {selectedOrder.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Update Form */}
                  <div className={styles.statusUpdate}>
                    <h4>
                      <i className="fa-solid fa-sync-alt"></i> Update Order
                      Status
                    </h4>
                    <form
                      onSubmit={handleUpdateStatus}
                      className={styles.statusForm}
                    >
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="status">
                            <i className="fa-solid fa-flag"></i> Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={statusForm.status}
                            onChange={handleStatusChange}
                            className={styles.formSelect}
                            required
                          >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="trackingNumber">
                            <i className="fa-solid fa-barcode"></i> Tracking
                            Number
                          </label>
                          <input
                            type="text"
                            id="trackingNumber"
                            name="trackingNumber"
                            value={statusForm.trackingNumber}
                            onChange={handleStatusChange}
                            className={styles.formInput}
                            placeholder="Enter tracking number"
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="notes">
                          <i className="fa-solid fa-sticky-note"></i> Admin
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={statusForm.notes}
                          onChange={handleStatusChange}
                          rows="3"
                          className={styles.formTextarea}
                          placeholder="Add any notes or updates for this order..."
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton}>
                          <i className="fa-solid fa-save"></i> Update Status
                        </button>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => setShowOrderModal(false)}
                        >
                          <i className="fa-solid fa-times"></i> Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
