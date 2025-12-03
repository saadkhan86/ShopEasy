import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAlert } from "../context/AlertContext"; // Import alert context
// import Alert from "../Alert/Alert"; // Import Alert component
import styles from "./ResetPassword.module.css";

function ResetPassword() {
  const { token } = useParams(); // Gets token from URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showAlert } = useAlert(); // Get alert function
  const navigate = useNavigate();

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      showAlert("failure", "Invalid reset link", "Invalid Link");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/password/verify-reset-token/${token}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setValidToken(true);
          setEmail(data.email);
        } else {
          showAlert("failure", data.message || "Invalid or expired reset link", "Link Expired");
          setTimeout(() => {
            navigate("/forgot-password");
          }, 3000);
        }
      } catch (error) {
        showAlert("failure", "Network error. Please try again.", "Connection Error");
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
    };

    verifyToken();
  }, [token, navigate, showAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      showAlert("failure", "Please fill in all fields", "Missing Information");
      return;
    }

    if (password.length < 6) {
      showAlert("failure", "Password must be at least 6 characters", "Weak Password");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("failure", "Passwords do not match", "Password Mismatch");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/password/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert("success", "Password reset successful! You can now login with your new password.", "Success!");
        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        showAlert("failure", data.message || "Failed to reset password", "Error");
      }
    } catch (error) {
      showAlert("failure", "Network error. Please try again.", "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && !success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingMessage}>
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Verifying reset link...</p>
            <p className={styles.verifyingNote}>
              Please wait while we verify your reset link
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <h3>Password Reset Successful!</h3>
            <p>Your password has been reset successfully.</p>
            <p>You can now login with your new password.</p>
            <div className={styles.redirectTimer}>
              <i className="fa-solid fa-clock"></i> Redirecting to login in 3 seconds
            </div>
            <div className={styles.actionButtons}>
              <Link to="/login" className={styles.loginLink}>
                <i className="fa-solid fa-right-to-bracket"></i> Go to Login Now
              </Link>
              <Link to="/" className={styles.homeLink}>
                <i className="fa-solid fa-home"></i> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Your Password</h1>
        
        {validToken && (
          <>
            <p className={styles.subtitle}>
              Reset password for: <span className={styles.email}>{email}</span>
            </p>
            <p className={styles.securityNote}>
              <i className="fa-solid fa-shield-alt"></i> Create a strong password with letters, numbers, and symbols
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  New Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={styles.input}
                    placeholder="Enter new password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    className={styles.showButton}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <i
                      className={`fa-solid ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                <div className={styles.passwordHint}>
                  <i className="fa-solid fa-info-circle"></i> At least 6 characters
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={styles.input}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  minLength="6"
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
                    <i className="fa-solid fa-spinner fa-spin"></i> Resetting Password...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-key"></i> Reset Password
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className={styles.footer}>
          <p>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Need another reset link?{" "}
            <Link to="/forgot-password">Request again</Link>
          </p>
          <p className={styles.helpNote}>
            <i className="fa-solid fa-circle-question"></i> Having trouble? Contact support
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;