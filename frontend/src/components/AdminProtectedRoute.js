import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import styles from "./AdminProtectedRoute.module.css";

const AdminProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const savedAdmin = localStorage.getItem("adminUser");

        // Quick check - if no localStorage data, no need to call API
        if (!token || !savedAdmin) {
          if (mounted) {
            setAuthState({
              loading: false,
              isAuthenticated: false,
              isAdmin: false,
            });
          }
          return;
        }

        // Verify with backend
        const response = await fetch(
          "http://localhost:5000/api/admin/check-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (mounted) {
          setAuthState({
            loading: false,
            isAuthenticated: data.success,
            isAdmin: data.isAdmin === true,
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setAuthState({
            loading: false,
            isAuthenticated: false,
            isAdmin: false,
          });
        }
      }
    };

    // Small delay to prevent rapid state updates
    timeoutId = setTimeout(checkAuth, 50);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (authState.loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <i className="fa-solid fa-crown fa-spin"></i>
        </div>
        <p className={styles.loadingText}>Checking admin privileges...</p>
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
