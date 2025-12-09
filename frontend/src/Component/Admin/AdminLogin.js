import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // New state for auth check

  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api/admin";

  // Check if user is already authenticated as admin
  useEffect(() => {
    const checkExistingAdminSession = async () => {
      // Try to get regular user token first
      const userToken = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");

      // If we have an admin token, verify it
      if (adminToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/check-status`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          });

          const data = await response.json();

          if (data.success && data.isAdmin) {
            // Already authenticated as admin, redirect to dashboard
            showAlert("success", "Already logged in as admin", "Welcome Back!");
            navigate("/admin/dashboard");
            return;
          } else {
            // Invalid admin token, remove it
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
          }
        } catch (error) {
          // Token verification failed
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        }
      }

      // Check if regular user token exists and user is admin
      if (userToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/check-status`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });

          const data = await response.json();

          if (data.success && data.isAdmin) {
            // Regular user is admin, use their token for admin access
            showAlert("success", "Admin access detected", "Redirecting...");

            // Store admin credentials
            localStorage.setItem("adminToken", userToken);
            localStorage.setItem("adminUser", JSON.stringify(data.user));

            // Redirect to admin dashboard
            navigate("/admin/dashboard");
            return;
          }
        } catch (error) {
          // Token verification failed, continue to login page
          console.log("Token verification failed, showing login form",error.message);
        }
      }

      // If we reach here, no valid admin session exists
      setCheckingAuth(false);
    };

    checkExistingAdminSession();
  }, [navigate, showAlert]); // Dependencies

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      showAlert("warning", "Please fill in all fields", "Missing Fields");
      return;
    }

    if (!formData.email.includes("@")) {
      showAlert("warning", "Please enter a valid email", "Invalid Email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        // Store token and admin info
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));

        // Also update regular user session if needed
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        showAlert("success", "Admin login successful", "Welcome!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      showAlert("failure", error.message, "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <i className="fa-solid fa-shield-alt fa-spin fa-3x"></i>
            <h2>Verifying Admin Access...</h2>
            <p>Checking your authentication status</p>
            <div className={styles.loadingSpinner}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <i className="fa-solid fa-crown"></i>
              <h1>Admin Panel</h1>
            </div>
            <p className={styles.subtitle}>ShopEasy Dashboard Access</p>

            {/* Quick Admin Check (Optional) */}
            <div className={styles.quickCheck}>
              <button
                className={styles.quickCheckBtn}
                onClick={async () => {
                  const userToken = localStorage.getItem("token");
                  if (userToken) {
                    try {
                      const response = await fetch(
                        `${API_BASE_URL}/check-status`,
                        {
                          headers: { Authorization: `Bearer ${userToken}` },
                        }
                      );
                      const data = await response.json();

                      if (data.isAdmin) {
                        showAlert(
                          "info",
                          "You're already an admin user!",
                          "Admin Detected"
                        );
                        setFormData({
                          email: data.user.email || "",
                          password: "",
                        });
                      } else {
                        showAlert(
                          "warning",
                          "Regular user account detected",
                          "Not an Admin"
                        );
                      }
                    } catch (error) {
                      showAlert("failure", "Session expired", "Please login");
                    }
                  } else {
                    showAlert("info", "No active session", "Please login");
                  }
                }}
                title="Check if current session has admin access"
              >
                <i className="fa-solid fa-magnifying-glass"></i> Check Admin
                Status
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <i className="fa-solid fa-envelope"></i> Admin Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@shopeasy.com"
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                <i className="fa-solid fa-lock"></i> Password
              </label>
              <div className={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={styles.input}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.showPasswordBtn}
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Logging in...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-sign-in-alt"></i> Login to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.securityNote}>
              <i className="fa-solid fa-shield-alt"></i>
              <span>
                Secure admin access only. Unauthorized access prohibited.
              </span>
            </div>

            <button onClick={() => navigate("/")} className={styles.backToHome}>
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </button>

            {/* Optional: Quick access for admin users */}
            <div className={styles.quickAccess}>
              <p>Already have a user account?</p>
              <button
                onClick={async () => {
                  const userToken = localStorage.getItem("token");
                  if (userToken) {
                    try {
                      const response = await fetch(
                        `${API_BASE_URL}/check-status`,
                        {
                          headers: { Authorization: `Bearer ${userToken}` },
                        }
                      );
                      const data = await response.json();

                      if (data.isAdmin) {
                        // Auto-login to admin with existing token
                        localStorage.setItem("adminToken", userToken);
                        localStorage.setItem(
                          "adminUser",
                          JSON.stringify(data.user)
                        );
                        showAlert(
                          "success",
                          "Admin access granted!",
                          "Welcome"
                        );
                        navigate("/admin/dashboard");
                      } else {
                        showAlert(
                          "warning",
                          "Your account doesn't have admin privileges",
                          "Access Denied"
                        );
                      }
                    } catch (error) {
                      showAlert("failure", "Session expired", "Please login");
                    }
                  } else {
                    showAlert(
                      "info",
                      "Please login first",
                      "No Active Session"
                    );
                  }
                }}
                className={styles.useExistingBtn}
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i> Use
                Existing Session
              </button>
            </div>
          </div>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <i className="fa-solid fa-chart-line"></i>
              <span>Analytics Dashboard</span>
            </div>
            <div className={styles.feature}>
              <i className="fa-solid fa-users"></i>
              <span>User Management</span>
            </div>
            <div className={styles.feature}>
              <i className="fa-solid fa-box"></i>
              <span>Product Control</span>
            </div>
            <div className={styles.feature}>
              <i className="fa-solid fa-shopping-cart"></i>
              <span>Order Tracking</span>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className={styles.sidePanel}>
          <div className={styles.sideContent}>
            <h2>ShopEasy Admin Dashboard</h2>
            <p className={styles.sideDescription}>
              Manage your entire e-commerce platform from one powerful
              dashboard. Monitor sales, manage products, track orders, and
              analyze customer data.
            </p>

            <div className={styles.adminPrivileges}>
              <h3>
                <i className="fa-solid fa-key"></i> Admin Privileges
              </h3>
              <ul>
                <li>
                  <i className="fa-solid fa-check"></i> Full user management
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Product CRUD operations
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Order processing &
                  tracking
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Sales analytics &
                  reports
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> Inventory management
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> System configuration
                </li>
              </ul>
            </div>

            <div className={styles.warningBox}>
              <i className="fa-solid fa-exclamation-triangle"></i>
              <div>
                <strong>Security Notice</strong>
                <p>
                  This panel is restricted to authorized personnel only. All
                  activities are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
