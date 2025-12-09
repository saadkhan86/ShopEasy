import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

const AdminSidebar = ({ isOpen = false, onClose, onToggle }) => {
  const navigate = useNavigate();

  // Helper function to close sidebar on mobile after navigation
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 992 && onClose) {
      onClose();
    }
  };

  // Navigation items that match your endpoints
  const navItems = [
    { 
      path: "/admin/dashboard", 
      icon: "fa-tachometer-alt", 
      label: "Dashboard",
      endpoint: null // Dashboard is a page, not an endpoint
    },
    { 
      path: "/admin/users", 
      icon: "fa-users", 
      label: "Users",
      endpoint: "/api/admin/users" // GET /api/admin/users
    },
    { 
      path: "/admin/products", 
      icon: "fa-box", 
      label: "Products",
      endpoint: "/api/admin/products" // GET /api/admin/products
    },
    { 
      path: "/admin/orders", 
      icon: "fa-shopping-cart", 
      label: "Orders",
      endpoint: "/api/admin/orders" // GET /api/admin/orders
    },
    { 
      path: "/admin/analytics", 
      icon: "fa-chart-line", 
      label: "Analytics",
      endpoint: "/api/admin/analytics" // GET /api/admin/analytics
    },
  ];

  // Quick actions that should navigate to forms
  const quickLinks = [
    {
      icon: "fa-plus",
      label: "Add Product",
      action: () => navigate("/admin/products/add"),
      endpoint: null // Form page
    },
    {
      icon: "fa-user-plus",
      label: "Add User",
      action: () => navigate("/admin/users/add"),
      endpoint: null // Form page
    },
  ];

  // Handle navigation with data fetching
  const handleNavigation = (path, endpoint) => {
    navigate(path);
    closeSidebarOnMobile();
    
    // If there's an endpoint, you could fetch data here
    // but typically data fetching happens in the page component
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      {/* Logo with close button for mobile */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <i className="fa-solid fa-crown"></i>
        </div>
        <div className={styles.logoText}>
          <h2>ShopEasy</h2>
          <span>Admin Panel</span>
        </div>

        {/* Close button for mobile */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Toggle Sidebar Button */}
        <div className={styles.navSection}>
          <button
            onClick={onToggle}
            className={styles.toggleButton}
            aria-label="Toggle sidebar"
          >
            <i
              className={`fa-solid ${
                isOpen ? "fa-chevron-left" : "fa-chevron-right"
              }`}
            ></i>
            <span>{isOpen ? "Collapse Sidebar" : "Expand Sidebar"}</span>
          </button>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fa-solid fa-bars"></i> Navigation
          </h3>
          <ul className={styles.navList}>
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  end
                  onClick={() => handleNavigation(item.path, item.endpoint)}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  <span>{item.label}</span>
                  {!item.endpoint && <span className={styles.warningBadge} title="Endpoint not implemented">!</span>}
                  {index === 0 && <span className={styles.badge}>New</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>
            <i className="fa-solid fa-bolt"></i> Quick Actions
          </h3>
          <div className={styles.quickActions}>
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => {
                  link.action();
                  closeSidebarOnMobile();
                }}
                className={styles.quickActionBtn}
                title={!link.endpoint ? "Page not implemented" : ""}
              >
                <i className={`fa-solid ${link.icon}`}></i>
                <span>{link.label}</span>
                {/* {!link.endpoint && <span className={styles.quickWarning}>!</span>} */}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.systemStatus}>
          <h3 className={styles.sectionTitle}>
            <i className="fa-solid fa-server"></i> System Status
          </h3>
          <div className={styles.statusItem}>
            <div className={styles.statusIndicator}>
              <span className={`${styles.statusDot} ${styles.statusOnline}`}></span>
              <span>Users API</span>
            </div>
            <span className={styles.statusValue}>Online</span>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusIndicator}>
              <span className={`${styles.statusDot} ${styles.statusOnline}`}></span>
              <span>Products API</span>
            </div>
            <span className={styles.statusValue}>Online</span>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusIndicator}>
              <span className={`${styles.statusDot} ${styles.statusOnline}`}></span>
              <span>Orders API</span>
            </div>
            <span className={styles.statusValue}>Online</span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLinks}>
          <button
            onClick={() => {
              navigate("/");
              closeSidebarOnMobile();
            }}
            className={styles.footerLink}
          >
            <i className="fa-solid fa-home"></i> Home
          </button>
          <button
            onClick={() => {
              navigate("/profile");
              closeSidebarOnMobile();
            }}
            className={styles.footerLink}
          >
            <i className="fa-solid fa-user"></i> Profile
          </button>
          <button
            onClick={() => {
              navigate("/admin/dashboard");
              closeSidebarOnMobile();
            }}
            className={styles.footerLink}
          >
            <i className="fa-solid fa-redo"></i> Refresh
          </button>
        </div>

        <div className={styles.version}>
          <span>v1.0.0</span>
          <span className={styles.build}>API Ready</span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;