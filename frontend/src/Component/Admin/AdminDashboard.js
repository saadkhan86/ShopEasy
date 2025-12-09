import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../Context/AdminContext";
import { useAlert } from "../Context/AlertContext";
import DeleteConfirmationModal from "../Alerts/DeleteConfirmation";
import CancelConfirmationModal from "../Alerts/CancelConfirmation";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    newUsersToday: 0,
    newProductsToday: 0,
    activeUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionToCancel, setActionToCancel] = useState(null);

  const { admin, logout } = useAdmin();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to get token from localStorage
  const getToken = () => {
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const statsData = await statsResponse.json();
      if (!statsResponse.ok) {
        throw new Error(statsData.message || "Failed to fetch stats");
      }
      if (statsData.success) {
        setStats(statsData.stats || {});
      }

      // Fetch analytics
      const analyticsResponse = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setTopProducts(analyticsData.analytics?.topProducts || []);
      }

      // Fetch recent orders
      const ordersResponse = await fetch(
        `${API_BASE_URL}/admin/orders?limit=5&sort=createdAt:desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        setRecentOrders(ordersData.orders || []);
      }

      // Fetch recent users
      const usersResponse = await fetch(
        `${API_BASE_URL}/admin/users?limit=5&sort=createdAt:desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const usersData = await usersResponse.json();
      if (usersData.success) {
        const activities = (usersData.users || []).map((user) => ({
          type: "user_register",
          text: `New user registered: ${user.email}`,
          time: user.createdAt,
          icon: "fa-user-plus",
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      showAlert("failure", error.message, "Dashboard Error");

      if (
        error.message.includes("token") ||
        error.message.includes("unauthorized")
      ) {
        logout();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Action Button Clicks with confirmation
  const handleQuickAction = async (action) => {
    const token = getToken();

    switch (action) {
      case "addProduct":
        navigate("/admin/products/add");
        break;

      case "addUser":
        navigate("/admin/users/add");
        break;

      case "createOrder":
        openDeleteModal(
          "Create Test Order",
          "Are you sure you want to create a test order? This will add a demo order to the system.",
          "Create Order",
          async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/admin/orders/create`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    // Demo order data
                    products: [{ productId: "demo", quantity: 1 }],
                    totalAmount: 99.99,
                    customerName: "Test Customer",
                  }),
                }
              );

              const data = await response.json();
              if (data.success) {
                showAlert(
                  "success",
                  "Test order created successfully",
                  "Success"
                );
                fetchDashboardData();
              } else {
                showAlert(
                  "failure",
                  data.message || "Failed to create order",
                  "Error"
                );
              }
            } catch (error) {
              showAlert("failure", "Failed to create order", "Error");
            }
          }
        );
        break;

      case "viewReports":
        navigate("/admin/reports");
        break;

      case "settings":
        navigate("/admin/settings");
        break;

      case "help":
        navigate("/admin/help");
        break;

      default:
        break;
    }
  };

  // Handle Alert Action buttons with confirmation
  const handleAlertAction = async (action) => {
    const token = getToken();

    switch (action) {
      case "restock":
        try {
          const response = await fetch(
            `${API_BASE_URL}/admin/products?stock=low`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          if (data.success) {
            navigate("/admin/products", { state: { lowStock: true } });
          }
        } catch (error) {
          showAlert("failure", "Failed to fetch low stock products", "Error");
        }
        break;

      case "backup":
        openDeleteModal(
          "Initiate Backup",
          "Are you sure you want to initiate a system backup? This process may take several minutes.",
          "Start Backup",
          async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/admin/backup`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (data.success) {
                showAlert(
                  "success",
                  "Backup initiated successfully",
                  "Backup Started"
                );
              }
            } catch (error) {
              showAlert("failure", "Backup failed", "Error");
            }
          }
        );
        break;

      case "checkUpdates":
        showAlert("info", "Checking for updates...", "System Update");
        break;

      default:
        break;
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (title, message, confirmText, onConfirmAction) => {
    setShowDeleteModal({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm: onConfirmAction,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (showDeleteModal.onConfirm) {
      await showDeleteModal.onConfirm();
    }
    setShowDeleteModal({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null,
    });
  };

  // Handle delete close
  const handleDeleteClose = () => {
    setShowDeleteModal({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null,
    });
  };

  // Open cancel confirmation modal
  const openCancelModal = (action) => {
    setActionToCancel(action);
    setShowCancelModal(true);
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    setActionToCancel(null);
    showAlert("info", "Action cancelled", "Cancelled");
  };

  // Handle cancel close
  const handleCancelClose = () => {
    setShowCancelModal(false);
    setActionToCancel(null);
  };

  const handleViewAll = (section) => {
    switch (section) {
      case "orders":
        navigate("/admin/orders");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "products":
        navigate("/admin/products");
        break;
      default:
        navigate(`/admin/${section}`);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: formatNumber(stats.totalUsers),
      icon: "fa-users",
      color: "#28a745",
      change: stats.newUsersToday,
      changeText: `+${stats.newUsersToday} today`,
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Total Products",
      value: formatNumber(stats.totalProducts),
      icon: "fa-box",
      color: "#007bff",
      change: stats.newProductsToday,
      changeText: `+${stats.newProductsToday} today`,
      onClick: () => navigate("/admin/products"),
    },
    {
      title: "Total Orders",
      value: formatNumber(stats.totalOrders),
      icon: "fa-shopping-cart",
      color: "#ff6b6b",
      change: 0,
      changeText: "Process all orders",
      onClick: () => navigate("/admin/orders"),
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "fa-money-bill-wave",
      color: "#ffc107",
      change: stats.todayRevenue,
      changeText: `+${formatCurrency(stats.todayRevenue)} today`,
      onClick: () => navigate("/admin/analytics"),
    },
    {
      title: "Active Users",
      value: formatNumber(stats.activeUsers),
      icon: "fa-user-check",
      color: "#17a2b8",
      change: Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0,
      changeText: `${
        Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0
      }% of total`,
      onClick: () => navigate("/admin/users?filter=active"),
    },
    {
      title: "Low Stock",
      value: formatNumber(stats.lowStockProducts),
      icon: "fa-exclamation-triangle",
      color: "#dc3545",
      change: stats.lowStockProducts,
      changeText: "Need restocking",
      onClick: () => {
        navigate("/admin/products");
        showAlert("info", "Showing low stock products", "Low Stock");
      },
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <i className="fa-solid fa-chart-line fa-spin"></i>
        </div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title={showDeleteModal.title || "Confirm Action"}
        message={showDeleteModal.message || "Are you sure you want to proceed?"}
        confirmText={showDeleteModal.confirmText || "Confirm"}
        cancelText="Cancel"
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Action"
        message={`Are you sure you want to cancel ${
          actionToCancel || "this action"
        }?`}
        confirmText="Yes, Cancel"
        cancelText="Continue"
        hasChanges={true}
      />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <i className="fa-solid fa-tachometer-alt"></i> Admin Dashboard
            </h1>
            <p className={styles.welcomeText}>
              Welcome back,{" "}
              <span className={styles.adminName}>{admin?.name}</span>
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.adminInfo}>
              <div className={styles.adminAvatar}>
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div className={styles.adminDetails}>
                <span className={styles.adminRole}>Administrator</span>
                <span className={styles.adminEmail}>{admin?.email}</span>
              </div>
            </div>

            <button
              onClick={() => fetchDashboardData()}
              className={styles.refreshBtn}
            >
              <i className="fa-solid fa-sync-alt"></i> Refresh
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={styles.stat}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(40, 167, 69, 0.2)" }}
            >
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Server Time</span>
              <span className={styles.statValue}>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className={styles.stat}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(0, 123, 255, 0.2)" }}
            >
              <i className="fa-solid fa-database"></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>System Status</span>
              <span className={styles.statValue}>
                <span className={styles.statusOnline}></span> All Systems
                Operational
              </span>
            </div>
          </div>

          <div className={styles.stat}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(255, 193, 7, 0.2)" }}
            >
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Performance</span>
              <span className={styles.statValue}>98.7% Uptime</span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className={styles.statsGrid}>
          {statCards.map((card, index) => (
            <div
              key={index}
              className={styles.statCard}
              onClick={card.onClick}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.statCardHeader}>
                <div
                  className={styles.statIconWrapper}
                  style={{ background: `${card.color}20` }}
                >
                  <i
                    className={`fa-solid ${card.icon}`}
                    style={{ color: card.color }}
                  ></i>
                </div>
                <span className={styles.statTitle}>{card.title}</span>
              </div>

              <div className={styles.statCardBody}>
                <span className={styles.statValue}>{card.value}</span>
                {card.change > 0 && (
                  <span className={styles.statChange}>
                    <i className="fa-solid fa-arrow-up"></i> {card.changeText}
                  </span>
                )}
              </div>

              <div className={styles.statCardFooter}>
                <div className={styles.statProgress}>
                  <div
                    className={styles.progressBar}
                    style={{
                      width: `${Math.min(card.change * 10, 100)}%`,
                      background: card.color,
                    }}
                  ></div>
                </div>
                <span className={styles.statTrend}>
                  View Details <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className={styles.contentGrid}>
          {/* Recent Orders */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>
                <i className="fa-solid fa-shopping-cart"></i> Recent Orders
              </h3>
              <button
                className={styles.viewAllBtn}
                onClick={() => handleViewAll("orders")}
              >
                View All
              </button>
            </div>

            <div className={styles.activityList}>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <div key={order._id || index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <i className="fa-solid fa-receipt"></i>
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        Order #{order.orderNumber || order._id?.slice(-6)} - $
                        {order.totalAmount?.toFixed(2) || "0.00"}
                      </p>
                      <span className={styles.activityTime}>
                        <i className="fa-solid fa-clock"></i>{" "}
                        {formatTimeAgo(order.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>
                  <i className="fa-solid fa-inbox"></i>
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>
                <i className="fa-solid fa-bolt"></i> Quick Actions
              </h3>
              <button
                className={`${styles.viewAllBtn} ${styles.cancelActionBtn}`}
                onClick={() => openCancelModal("Quick Actions")}
              >
                Cancel Actions
              </button>
            </div>

            <div className={styles.actionsGrid}>
              <button
                className={styles.actionBtn}
                onClick={() => handleQuickAction("addProduct")}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add Product</span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => handleQuickAction("addUser")}
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Add User</span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => handleQuickAction("createOrder")}
              >
                <i className="fa-solid fa-file-invoice-dollar"></i>
                <span>Create Order</span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => handleQuickAction("viewReports")}
              >
                <i className="fa-solid fa-chart-bar"></i>
                <span>View Reports</span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => handleQuickAction("settings")}
              >
                <i className="fa-solid fa-cog"></i>
                <span>Settings</span>
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => handleQuickAction("help")}
              >
                <i className="fa-solid fa-question-circle"></i>
                <span>Help Center</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Products Section */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3>
              <i className="fa-solid fa-star"></i> Top Selling Products
            </h3>
            <button
              className={styles.viewAllBtn}
              onClick={() => handleViewAll("products")}
            >
              View All
            </button>
          </div>

          <div className={styles.topProductsList}>
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product._id || index}
                  className={styles.topProductItem}
                >
                  <div className={styles.productIcon}>
                    <i className="fa-solid fa-box"></i>
                  </div>
                  <div className={styles.productInfo}>
                    <strong className={styles.productName}>
                      {product.name || `Product ${index + 1}`}
                    </strong>
                    <span className={styles.productSales}>
                      {product.sold || product.quantitySold || 0} sold
                    </span>
                  </div>
                  <span className={styles.productRevenue}>
                    ${product.revenue?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.noData}>
                <i className="fa-solid fa-chart-line"></i>
                <p>No product data available</p>
              </div>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className={styles.alertsSection}>
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3>
                <i className="fa-solid fa-bell"></i> System Alerts
              </h3>
              <span className={styles.alertBadge}>
                {stats.lowStockProducts > 0 ? 1 : 0}
              </span>
            </div>

            <div className={styles.alertsList}>
              {stats.lowStockProducts > 0 && (
                <div className={`${styles.alertItem} ${styles.alertWarning}`}>
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  <div className={styles.alertContent}>
                    <strong>Low Stock Alert</strong>
                    <p>
                      {stats.lowStockProducts} products are running low on stock
                    </p>
                  </div>
                  <button
                    className={styles.alertAction}
                    onClick={() => handleAlertAction("restock")}
                  >
                    Restock Now
                  </button>
                </div>
              )}

              <div className={`${styles.alertItem} ${styles.alertInfo}`}>
                <i className="fa-solid fa-info-circle"></i>
                <div className={styles.alertContent}>
                  <strong>Backup Required</strong>
                  <p>Database backup is due in 2 days</p>
                </div>
                <button
                  className={styles.alertAction}
                  onClick={() => handleAlertAction("backup")}
                >
                  Backup Now
                </button>
              </div>

              <div className={`${styles.alertItem} ${styles.alertSuccess}`}>
                <i className="fa-solid fa-check-circle"></i>
                <div className={styles.alertContent}>
                  <strong>System Update</strong>
                  <p>All systems are up to date</p>
                </div>
                <button
                  className={styles.alertAction}
                  onClick={() => handleAlertAction("checkUpdates")}
                >
                  Check Updates
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.copyright}>
              <i className="fa-solid fa-copyright"></i>{" "}
              {new Date().getFullYear()} ShopEasy Admin Panel
            </p>
            <div className={styles.footerLinks}>
              <a href="/admin/docs">Documentation</a>
              <a href="/admin/support">Support</a>
              <a href="/admin/privacy">Privacy Policy</a>
              <a href="/admin/terms">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AdminDashboard;
