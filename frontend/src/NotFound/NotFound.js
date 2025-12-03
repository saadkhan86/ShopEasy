// src/NotFound/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={`${styles.button} ${styles.primary}`}>
            Go to Homepage
          </Link>
          <button 
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
        <div className={styles.links}>
          <Link to="/login" className={styles.link}>Login</Link>
          <Link to="/signup" className={styles.link}>Sign Up</Link>
          <Link to="/about" className={styles.link}>About Us</Link>
          <Link to="/terms" className={styles.link}>Terms & Conditions</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;