import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import styles from "./Login.module.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!form.email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Email is invalid";
    }

    if (!form.password) {
      tempErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      // Handle different status codes
      if (!response.ok) {
        if (response.status === 401) {
          // Invalid credentials
          showAlert(
            "failure",
            "Invalid email or password. Please check your credentials.",
            "Authentication Failed"
          );
        } else if (response.status === 404) {
          // User not found
          showAlert(
            "failure",
            "No account found with this email. Please sign up first.",
            "Account Not Found"
          );
        } else if (response.status === 400) {
          // Bad request
          showAlert(
            "failure",
            data.message || "Please check your input and try again.",
            "Invalid Request"
          );
          setErrors({ submit: data.message || "Invalid request" });
        } else if (response.status === 500) {
          // Server error
          showAlert(
            "failure",
            "Server error. Please try again later.",
            "Server Error"
          );
        } else {
          // Other errors
          showAlert(
            "failure",
            data.message || "Login failed. Please try again.",
            "Login Error"
          );
          setErrors({ submit: data.message || "Login failed" });
        }
        return;
      }

      // SUCCESS: Login successful
      if (data.success) {
        showAlert(
          "success",
          "Login successful! Redirecting to home page...",
          "Welcome Back!"
        );

        // Use auth context to login
        login(data.user, data.token);

        // Redirect to home page
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      // Network or unexpected errors
      if (
        error.message.includes("network") ||
        error.message.includes("Network") ||
        error.message.includes("Failed to fetch")
      ) {
        showAlert(
          "failure",
          "Network error. Please check your internet connection and try again.",
          "Connection Error"
        );
        setErrors({ submit: "Network error" });
      } else {
        showAlert(
          "failure",
          "An unexpected error occurred. Please try again.",
          "Error"
        );
        setErrors({ submit: "Unexpected error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    showAlert(
      "info",
      `${provider} login integration would be implemented here in a production app.`,
      "Social Login"
    );
  };
  function generateStrongPassword(length = 24) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = "";

    // Ensure at least one of each type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest with random characters
    for (let i = 10; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
  // Add this function to navigate to forgot password
  const handleForgotPassword = () => {
    let pre="sdf1fdd1";
    let post="1y2u2tg3";
    let idOfUser = pre+generateStrongPassword()+post;
    navigate(`/forgot/${idOfUser}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          Sign in to your account to continue your shopping experience
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.submit && <div className={styles.error}>{errors.submit}</div>}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}

          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.showBtn}
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <i
                className={`fa-solid ${
                  showPassword ? "fa-eye" : "fa-eye-slash"
                }`}
              ></i>
            </button>
          </div>
          {errors.password && (
            <span className={styles.error}>{errors.password}</span>
          )}

          {/* Add Forgot Password Link Here */}
          <div className={styles.forgotPassword}>
            <button
              type="button"
              onClick={handleForgotPassword}
              className={styles.forgotPasswordLink}
              disabled={loading}
            >
              <i className="fa-solid fa-key"></i> Forgot Password?
            </button>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <div className={styles.socialLogin}>
          <button
            className={`${styles.socialBtn} ${styles.google}`}
            onClick={() => handleSocialLogin("Google")}
            disabled={loading}
          >
            <i className="fa-brands fa-google"></i>
            Continue with Google
          </button>
          <button
            className={`${styles.socialBtn} ${styles.apple}`}
            onClick={() => handleSocialLogin("Apple")}
            disabled={loading}
          >
            <i className="fa-brands fa-apple"></i>
            Continue with Apple
          </button>
        </div>

        <div className={styles.signupLink}>
          Don't have an account?
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
