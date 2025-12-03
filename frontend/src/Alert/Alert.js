import React, { useState, useEffect } from "react";
import styles from "./Alert.module.css";
import PropTypes from "prop-types";

const Alert = ({
  status, // Required: 'success' or 'failure'
  message, // Required: message to display
  title = "",
  duration = 5000,
  onClose,
  show = false,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Validate required props
  useEffect(() => {
    if (!status || !message) {
      return 
    }
  }, [status, message]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);
      setProgress(100);
    }
  }, [show]);

  useEffect(() => {
    if (isVisible && !isExiting) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const decrement = (100 / duration) * 50; // Update every 50ms
          return Math.max(prev - decrement, 0);
        });
      }, 50);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, isExiting, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const handleCloseClick = () => {
    handleClose();
  };

  // Don't render if required props are missing
  if (!status || !message) {
    return null;
  }

  if (!isVisible) return null;

  // Determine type based on status
  const type = status === "success" ? "success" : "error";

  const alertClass = `${styles.alert} ${
    type === "success" ? styles.alertSuccess : styles.alertError
  } ${isExiting ? styles.alertExiting : ""}`;

  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  const defaultTitle = type === "success" ? "Success!" : "Error!";

  return (
    <div className={styles.alertContainer}>
      <div className={alertClass}>
        <div className={styles.alertIcon}>
          <i className={`fa-solid ${icon}`}></i>
        </div>

        <div className={styles.alertContent}>
          <div className={styles.alertTitle}>{title || defaultTitle}</div>
          <p className={styles.alertMessage}>{message}</p>

          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${
                type === "success"
                  ? styles.progressSuccess
                  : styles.progressError
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          className={styles.closeButton}
          onClick={handleCloseClick}
          aria-label="Close alert"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
};

// PropTypes for required parameters
Alert.propTypes = {
  status: PropTypes.oneOf(["success", "failure"]),
  message: PropTypes.string,
  title: PropTypes.string,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  show: PropTypes.bool,
};

// Default props for optional parameters
Alert.defaultProps = {
  title: "",
  duration: 5000,
  show: false,
};

export default Alert;
