import React from "react";
import styles from "./DeleteConfirmation.module.css";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Listing",
  message = "Are you sure you want to delete this listing? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>
              This will permanently remove the listing and all associated data.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            <i className="fa-solid fa-xmark"></i> {cancelText}
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            <i className="fa-solid fa-trash"></i> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
