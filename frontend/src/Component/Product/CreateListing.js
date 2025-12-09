import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";
import styles from "./CreateListing.module.css";
import { useAuth } from "../Context/AuthContext";
import CancelConfirmationModal from "../Alerts/CancelConfirmation";

const CreateListingForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: "",
    features: "",
    reviews: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const userId = useParams();
  const { user, token } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // Category options
  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing & Fashion" },
    { value: "shoes", label: "Shoes" },
    { value: "home", label: "Home & Kitchen" },
    { value: "books", label: "Books" },
    { value: "sports", label: "Sports & Outdoors" },
    { value: "beauty", label: "Beauty & Personal Care" },
    { value: "toys", label: "Toys & Games" },
    { value: "automotive", label: "Automotive" },
    { value: "other", label: "Other" },
  ];

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return Object.values(formData).some(
      (value) => value && value.toString().trim() !== ""
    );
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Handle image preview
    if (name === "image" && value) {
      setImagePreview(value);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (formData.stock && parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    // URL validation for image
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = "Please enter a valid URL";
    }

    return newErrors;
  };

  // Check if URL is valid
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      showAlert("error", "Please fix the errors in the form", "Form Error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert(
          "error",
          "Please login to create a listing",
          "Authentication Required"
        );
        navigate("/login");
        return;
      }

      // Prepare features array
      const featuresArray = formData.features
        ? formData.features
            .split(",")
            .map((feature) => feature.trim())
            .filter((feature) => feature)
        : [];

      const requestData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description.trim(),
        image: formData.image.trim() || "",
        stock: parseInt(formData.stock) || 0,
        features: featuresArray,
        reviews: formData.reviews.trim() || "",
      };

      const response = await fetch(
        "http://localhost:5000/api/products/listings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();

      if (data.success) {
        showAlert("success", "Listing created successfully!", "Success");

        // Reset form
        setFormData({
          title: "",
          price: "",
          category: "",
          description: "",
          image: "",
          stock: "",
          features: "",
          reviews: "",
        });
        setImagePreview("");
        setErrors({});

        // Navigate to user's listings or product page
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        showAlert("error", data.message || "Failed to create listing", "Error");
      }
    } catch (error) {
      console.error("Create listing error:", error);
      showAlert(
        "error",
        "Network error. Please try again.",
        "Connection Error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Open cancel confirmation modal
  const openCancelModal = () => {
    if (hasUnsavedChanges()) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigate(-1);
  };

  // Handle cancel close
  const handleCancelClose = () => {
    setShowCancelModal(false);
  };

  // Handle paste image URL
  const handlePasteImage = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (isValidUrl(clipboardText)) {
        setFormData((prev) => ({ ...prev, image: clipboardText }));
        setImagePreview(clipboardText);
        showAlert("info", "Image URL pasted from clipboard", "Pasted");
      }
    } catch (error) {
      // console.error("Failed to read clipboard:", error);
    }
  };

  return (
    <>
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Listing Creation"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        hasChanges={hasUnsavedChanges()}
      />

      <div className={styles.container}>
        <i
          className={`fa-solid fa-arrow-left ${styles.backArrow}`}
          onClick={openCancelModal}
        ></i>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className="fa-solid fa-plus-circle"></i> Create New Listing
          </h1>
          <p className={styles.subtitle}>
            Fill in the details below to create your product listing
          </p>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                <i className="fa-solid fa-heading"></i> Product Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.title ? styles.inputError : ""
                }`}
                placeholder="Enter product title (e.g., iPhone 15 Pro Max)"
                maxLength={100}
              />
              {errors.title && (
                <span className={styles.error}>{errors.title}</span>
              )}
              <div className={styles.charCount}>
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Price & Category Row */}
            <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="price" className={styles.label}>
                  <i className="fa-solid fa-tag"></i> Price (USD) *
                </label>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.price ? styles.inputError : ""
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && (
                  <span className={styles.error}>{errors.price}</span>
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="category" className={styles.label}>
                  <i className="fa-solid fa-list"></i> Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`${styles.select} ${styles.selectBG} ${
                    errors.category ? styles.inputError : ""
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className={styles.error}>{errors.category}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                <i className="fa-solid fa-file-lines"></i> Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${styles.textarea} ${
                  errors.description ? styles.inputError : ""
                }`}
                placeholder="Describe your product in detail..."
                rows={4}
                maxLength={1000}
              />
              {errors.description && (
                <span className={styles.error}>{errors.description}</span>
              )}
              <div className={styles.charCount}>
                {formData.description.length}/1000 characters
              </div>
            </div>

            {/* Image URL */}
            <div className={styles.formGroup}>
              <div className={styles.imageHeader}>
                <label htmlFor="image" className={styles.label}>
                  <i className="fa-solid fa-image"></i> Product Image URL
                </label>
                <button
                  type="button"
                  onClick={handlePasteImage}
                  className={styles.pasteButton}
                >
                  <i className="fa-solid fa-paste"></i> Paste URL
                </button>
              </div>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.image ? styles.inputError : ""
                }`}
                placeholder="https://example.com/product-image.jpg"
              />
              {errors.image && (
                <span className={styles.error}>{errors.image}</span>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <p className={styles.previewLabel}>Preview:</p>
                  <div className={styles.previewContainer}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.previewImage}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `
                          <div class="${styles.previewError}">
                            <i class="fa-solid fa-image"></i>
                            <span>Unable to load image</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stock & Features Row */}
            <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="stock" className={styles.label}>
                  <i className="fa-solid fa-boxes-stacked"></i> Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.stock ? styles.inputError : ""
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && (
                  <span className={styles.error}>{errors.stock}</span>
                )}
                <div className={styles.helpText}>
                  Leave empty or 0 for unlimited stock
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="features" className={styles.label}>
                  <i className="fa-solid fa-star"></i> Features (comma
                  separated)
                </label>
                <input
                  type="text"
                  id="features"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="5G, Waterproof, Fast Charging"
                />
                <div className={styles.helpText}>
                  Separate features with commas
                </div>
              </div>
            </div>

            {/* Reviews/Comments */}
            <div className={styles.formGroup}>
              <label htmlFor="reviews" className={styles.label}>
                <i className="fa-solid fa-comment"></i> Additional Notes
              </label>
              <textarea
                id="reviews"
                name="reviews"
                value={formData.reviews}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Any additional information or special notes..."
                rows={2}
                maxLength={500}
              />
              <div className={styles.charCount}>
                {formData.reviews.length}/500 characters
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={openCancelModal}
                className={styles.cancelButton}
                disabled={loading}
              >
                <i className="fa-solid fa-times"></i> Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Creating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus"></i> Create Listing
                  </>
                )}
              </button>
            </div>

            {/* Required Fields Note */}
            <div className={styles.requiredNote}>
              <i className="fa-solid fa-asterisk"></i> Fields marked with * are
              required
            </div>
          </form>

          {/* Preview Card */}
          <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>
              <i className="fa-solid fa-eye"></i> Live Preview
            </h3>
            <div className={styles.previewContent}>
              {formData.title || formData.description || formData.image ? (
                <>
                  {formData.image && (
                    <div className={styles.previewImageContainer}>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className={styles.previewCardImage}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="${styles.noPreviewImage}">
                              <i class="fa-solid fa-image"></i>
                              <span>No preview available</span>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  )}

                  <div className={styles.previewDetails}>
                    <h4 className={styles.previewProductTitle}>
                      {formData.title || "Untitled Product"}
                    </h4>

                    {formData.price && (
                      <div className={styles.previewPrice}>
                        <span className={styles.priceLabel}>Price:</span>
                        <span className={styles.priceValue}>
                          ${parseFloat(formData.price || 0).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {formData.category && (
                      <div className={styles.previewCategory}>
                        <span className={styles.categoryLabel}>Category:</span>
                        <span className={styles.categoryValue}>
                          {categories.find((c) => c.value === formData.category)
                            ?.label || formData.category}
                        </span>
                      </div>
                    )}

                    {formData.stock && (
                      <div className={styles.previewStock}>
                        <span className={styles.stockLabel}>Stock:</span>
                        <span className={styles.stockValue}>
                          {formData.stock} units
                        </span>
                      </div>
                    )}

                    {formData.description && (
                      <div className={styles.previewDescription}>
                        <p>{formData.description.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.emptyPreview}>
                  <i className="fa-solid fa-image"></i>
                  <p>Start typing to see a live preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default CreateListingForm;
