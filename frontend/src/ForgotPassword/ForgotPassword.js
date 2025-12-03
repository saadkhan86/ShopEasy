import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext"; // Import your alert hook
import styles from "./ForgotPassword.module.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showAlert } = useAlert(); // Get alert function from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showAlert("failure", "Please enter your email address", "Email Required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showAlert(
        "failure",
        "Please enter a valid email address",
        "Invalid Email"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/password/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Show alert based on backend message
        if (data.message.includes("No account found")) {
          // User doesn't exist - show failure alert with signup suggestion
          showAlert("failure", data.message, "Account Not Found", {
            action: "signup",
            actionText: "Create Account",
            onActionClick: () => navigate("/signup"),
          });
        } else {
          // Email sent successfully - show success alert
          showAlert("success", data.message, "Check Your Email");
          setEmailSent(true);
        }
      } else {
        // Error from backend
        showAlert(
          "failure",
          data.message || "Failed to send reset email",
          "Error"
        );
      }
    } catch (error) {
      showAlert(
        "failure",
        "Network error. Please check your connection and try again.",
        "Connection Error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot Password</h1>

        {!emailSent ? (
          <>
            <p className={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Checking...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <h3>Check Your Email</h3>

            <p>
              If an account exists with {email}, you will receive a password
              reset link shortly.
            </p>

            <div className={styles.securityNote}>
              <i className="fa-solid fa-shield-alt"></i>
              <p>
                <strong>Security Note:</strong> For your protection, we don't
                reveal whether an email is registered.
              </p>
            </div>

            <div className={styles.note}>
              <i className="fa-solid fa-clock"></i> The link will expire in 10
              minutes
            </div>

            <div className={styles.actionButtons}>
              <button
                className={styles.resendButton}
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                <i className="fa-solid fa-rotate-right"></i> Try Another Email
              </button>
              <Link to="/login" className={styles.backButton}>
                <i className="fa-solid fa-right-to-bracket"></i> Back to Login
              </Link>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
