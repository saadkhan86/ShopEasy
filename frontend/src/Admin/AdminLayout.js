// components/layout/AdminLayout.js
import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import styles from "./AdminLayout.module.css";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
