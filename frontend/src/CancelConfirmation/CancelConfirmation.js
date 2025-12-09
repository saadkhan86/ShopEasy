import React from "react";
import styles from "./CancelConfirmation.module.css";

const CancelConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Cancel Listing Creation",
  message = "Are you sure you want to cancel? All unsaved changes will be lost.",
  confirmText = "Yes, Cancel",
  cancelText = "Continue Editing",
  hasChanges = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <i className="fa-solid fa-exclamation-circle"></i>
          </div>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>

          {/* Warning Box - Only show if there are changes */}
          {hasChanges && (
            <div className={styles.warningBox}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div className={styles.warningContent}>
                <span className={styles.warningTitle}>Warning</span>
                <span className={styles.warningText}>
                  You have unsaved changes. If you cancel now, all entered
                  information will be lost.
                </span>
              </div>
            </div>
          )}

          {/* No Changes Message */}
          {!hasChanges && (
            <div className={styles.infoBox}>
              <i className="fa-solid fa-circle-info"></i>
              <span>No changes detected. You can safely cancel.</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.continueButton}>
            <i className="fa-solid fa-arrow-left"></i> {cancelText}
          </button>
          <button onClick={onConfirm} className={styles.cancelButton}>
            <i className="fa-solid fa-times"></i> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
