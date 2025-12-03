import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import styles from "./Signup.module.css";

// Country codes mapping
const COUNTRY_CODES = {
  pakistan: "+92",
  india: "+91",
  "united states": "+1",
  "united kingdom": "+44",
  canada: "+1",
  australia: "+61",
  china: "+86",
  japan: "+81",
  germany: "+49",
  france: "+33",
  italy: "+39",
  spain: "+34",
  brazil: "+55",
  mexico: "+52",
  russia: "+7",
  "south korea": "+82",
  "saudi arabia": "+966",
  uae: "+971",
  turkey: "+90",
  egypt: "+20",
};

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
    contact: "",
  });

  const [countryCode, setCountryCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shouldFocusContact, setShouldFocusContact] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const contactInputRef = useRef(null);

  // Update country code when country changes
  useEffect(() => {
    if (form.country.trim()) {
      const countryLower = form.country.toLowerCase().trim();

      // Find matching country code
      let foundCode = "";
      for (const [country, code] of Object.entries(COUNTRY_CODES)) {
        if (countryLower.includes(country) || country.includes(countryLower)) {
          foundCode = code;
          break;
        }
      }

      setCountryCode(foundCode);

      // Auto-apply country code to contact field if it's empty
      if (foundCode && !form.contact) {
        setForm((prev) => ({
          ...prev,
          contact: foundCode,
        }));
        setShouldFocusContact(true);
      }
    } else {
      setCountryCode("");
    }
  }, [form.country]);

  // Focus contact field after country code is set
  useEffect(() => {
    if (shouldFocusContact && contactInputRef.current && countryCode) {
      setTimeout(() => {
        contactInputRef.current.focus();
        // Move cursor to end of the input
        contactInputRef.current.setSelectionRange(
          countryCode.length,
          countryCode.length
        );
        setShouldFocusContact(false);
      }, 100);
    }
  }, [shouldFocusContact, countryCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      // Allow only numbers, plus, spaces, and hyphens
      let cleanedValue = value.replace(/[^\d+\s-]/g, "");

      // Ensure plus sign is only at the beginning
      if (cleanedValue.includes("+") && cleanedValue.indexOf("+") > 0) {
        cleanedValue = cleanedValue.replace(/\+/g, "");
        cleanedValue = "+" + cleanedValue;
      }

      // Ensure only one plus sign
      const plusCount = (cleanedValue.match(/\+/g) || []).length;
      if (plusCount > 1) {
        cleanedValue = cleanedValue.replace(/\+/g, "");
        cleanedValue = "+" + cleanedValue;
      }

      // If country code is set and user tries to remove it, prevent it
      if (countryCode && cleanedValue.length < countryCode.length) {
        cleanedValue = countryCode;
      }

      setForm({ ...form, [name]: cleanedValue });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleCountryKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (contactInputRef.current && form.country.trim()) {
        contactInputRef.current.focus();
      }
    }
  };

  const handleContactFocus = () => {
    if (countryCode && !form.contact.startsWith(countryCode)) {
      setForm((prev) => ({
        ...prev,
        contact: countryCode,
      }));
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!form.name.trim()) {
      tempErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      tempErrors.name = "Name must be at least 2 characters";
    }

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

    if (!form.country.trim()) {
      tempErrors.country = "Country is required";
    }

    // Validate contact number
    if (form.contact.trim()) {
      const digits = form.contact.replace(/\D/g, "");
      if (digits.length < 10) {
        tempErrors.contact =
          "Contact number must be at least 10 digits (including country code)";
      } else if (digits.length > 15) {
        tempErrors.contact = "Contact number is too long";
      } else if (!/^\+?[\d\s-]+$/.test(form.contact)) {
        tempErrors.contact = "Invalid contact number format";
      }

      // Check if contact starts with the detected country code
      if (countryCode && !form.contact.startsWith(countryCode)) {
        tempErrors.contact = `Phone number should start with ${countryCode} for ${form.country}`;
      }
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
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          country: form.country,
          contact: form.contact.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          showAlert(
            "failure",
            "This email is already registered. Please try logging in or use a different email address.",
            "Email Already Exists"
          );
          setErrors({ email: "This email is already registered" });
        } else if (response.status === 400) {
          showAlert(
            "failure",
            data.message || "Please check your information and try again.",
            "Invalid Data"
          );
          setErrors({
            submit: data.message || "Please check your information",
          });
        } else {
          showAlert(
            "failure",
            data.message || "Signup failed. Please try again.",
            "Registration Error"
          );
          setErrors({ submit: data.message || "Signup failed" });
        }
        return;
      }

      if (data.success || data.message) {
        showAlert(
          "success",
          "Account created successfully! Please check your email for verification code.",
          "Verification Required"
        );

        const userData = {
          name: form.name,
          email: form.email,
          country: form.country,
          phone: form.contact.trim() || "",
        };

        setTimeout(() => {
          navigate(`/signup/1w3s6h6j5e34h${userData.email}2j12h4f43d67jh/verification`, {
            state: {
              user: userData,
              email:userData.email
            },
          });
        }, 2000);
      }
    } catch (error) {
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
          "Signup failed. Please try again.",
          "Registration Error"
        );
        setErrors({ submit: "Signup failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    showAlert(
      "info",
      `${provider} signup integration would be implemented here in a production app.`,
      "Social Signup"
    );
  };

  const isContactDisabled = !form.country.trim() || loading;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Join ShopEasy</h1>
        <p className={styles.subtitle}>
          Create your account to start your shopping journey with unlimited
          access to amazing products
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.submit && <div className={styles.error}>{errors.submit}</div>}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className={styles.input}
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}

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

          <input
            type="text"
            name="country"
            placeholder="Country (e.g., Pakistan, USA)"
            className={styles.input}
            value={form.country}
            onChange={handleChange}
            onKeyDown={handleCountryKeyDown}
            disabled={loading}
          />
          {errors.country && (
            <span className={styles.error}>{errors.country}</span>
          )}

          <div className={styles.contactContainer}>
            <input
              ref={contactInputRef}
              type="tel"
              name="contact"
              placeholder={
                isContactDisabled
                  ? "Select country first"
                  : countryCode
                  ? `Phone number (${countryCode})`
                  : "Contact Number"
              }
              className={`${styles.input} ${
                isContactDisabled ? styles.disabledInput : ""
              }`}
              value={form.contact}
              onChange={handleChange}
              onFocus={handleContactFocus}
              disabled={isContactDisabled}
            />
            {countryCode && !isContactDisabled && (
              <div className={styles.countryCodeHint}>
                <i className="fas fa-flag"></i> {countryCode}
              </div>
            )}
          </div>
          {errors.contact && (
            <span className={styles.error}>{errors.contact}</span>
          )}

          {form.country.trim() && !countryCode && (
            <div className={styles.countryWarning}>
              <i className="fas fa-info-circle"></i>
              Country code not detected. Please enter full phone number with
              country code.
            </div>
          )}

          {countryCode && (
            <div className={styles.countryInfo}>
              <i className="fas fa-check-circle"></i>
              Country code {countryCode} detected. Enter your phone number after
              the code.
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Creating
                Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or sign up with</span>
        </div>

        <div className={styles.socialSignup}>
          <button
            className={`${styles.socialBtn} ${styles.google}`}
            onClick={() => handleSocialSignup("Google")}
            disabled={loading}
          >
            <i className="fa-brands fa-google"></i>
            Continue with Google
          </button>
          <button
            className={`${styles.socialBtn} ${styles.apple}`}
            onClick={() => handleSocialSignup("Apple")}
            disabled={loading}
          >
            <i className="fa-brands fa-apple"></i>
            Continue with Apple
          </button>
        </div>

        <div className={styles.loginLink}>
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>

        <div className={styles.terms}>
          By creating an account, you agree to our{" "}
          <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/terms">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
