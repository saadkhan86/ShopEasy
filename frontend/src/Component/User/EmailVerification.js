import React, { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";
import styles from "./EmailVerification.module.css";

function EmailVerification() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { email } = useParams(); // Get email from URL parameter
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Use the email from URL params directly
  const actualEmail = location.state?.email;
  console.log(actualEmail);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      showAlert("failure", "Please enter the OTP code", "OTP Required");
      return;
    }

    if (otp.length !== 6) {
      showAlert("failure", "OTP must be 6 digits", "Invalid OTP");
      return;
    }

    setLoading(true);
    try {
      console.log("one step far from /verify");
      const response = await fetch(`http://localhost:5000/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: actualEmail, // Use original email from URL
          otp: otp, // Send OTP to backend
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        showAlert(
          "failure",
          data.message || "OTP verification failed",
          "Verification Error"
        );
        return;
      }

      if (data.success) {
        showAlert(
          "success",
          "Email verified successfully! Your account has been created.",
          "Registration Complete"
        );

        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      showAlert(
        "failure",
        "Network error. Please try again.",
        "Connection Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/:${email}/resendotp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: actualEmail, // Use original email from URL
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showAlert(
          "failure",
          data.message || "Failed to resend OTP",
          "Resend Error"
        );
        return;
      }

      if (data.success) {
        showAlert("success", "New OTP sent successfully!", "OTP Sent");
      }
    } catch (error) {
      showAlert(
        "failure",
        "Network error. Please try again.",
        "Connection Error"
      );
    } finally {
      setResending(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>We've sent a 6-digit OTP to</p>
        <div className={styles.emailDisplay}>
          <strong className={styles.actualEmail}>{actualEmail}</strong>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>
              OTP Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className={styles.input}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.btn}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Verifying...
              </>
            ) : (
              "Verify & Create Account"
            )}
          </button>
        </form>

        <div className={styles.resendSection}>
          <p className={styles.resendText}>Didn't receive the OTP?</p>
          <button
            onClick={handleResendOTP}
            className={styles.resendBtn}
            disabled={resending}
          >
            {resending ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Sending...
              </>
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>

        <div className={styles.timerInfo}>
          <p className={styles.timerText}>
            <i className="fa-solid fa-clock"></i> OTP expires in 10 minutes
          </p>
        </div>

        <div className={styles.backToSignup}>
          <Link to="/signup">Back to Signup</Link>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
