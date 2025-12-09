import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useAuthFetch } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import CancelConfirmationModal from "../CancelConfirmation/CancelConfirmation";
import styles from "./EditListing.module.css";

const EditListing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: "",
    features: [],
  });
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { productId } = useParams();
  const { isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalData) return false;

    return (
      formData.title !== originalData.title ||
      formData.price !== originalData.price ||
      formData.category !== originalData.category ||
      formData.description !== originalData.description ||
      formData.image !== originalData.image ||
      formData.stock !== originalData.stock ||
      JSON.stringify(formData.features) !==
        JSON.stringify(originalData.features)
    );
  };

  // Fetch listing details
  useEffect(() => {
    console.log("edit Listing");
    const fetchListing = async () => {
      if (!isAuthenticated) {
        showAlert(
          "error",
          "Please login to edit listings",
          "Authentication Required"
        );
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await authFetch(
          `http://localhost:5000/api/products/listings/listing/${productId}`
        );
        const data = await response.json();

        if (data.success) {
          setListing(data.product);
          const initialFormData = {
            title: data.product.title || "",
            price: data.product.price || "",
            category: data.product.category || "",
            description: data.product.description || "",
            image: data.product.image || "",
            stock: data.product.stock || "",
            features: data.product.features || [],
          };

          setFormData(initialFormData);
          setOriginalData(initialFormData);
        } else {
          showAlert(
            "error",
            data.message || "Failed to fetch listing",
            "Error"
          );
          navigate("/my-listings");
        }
      } catch (error) {
        console.error("Fetch listing error:", error);
        showAlert("error", "Failed to load listing", "Error");
        navigate("/my-listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [productId, isAuthenticated]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle features input
  const handleFeaturesChange = (e) => {
    const features = e.target.value
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f);
    setFormData((prev) => ({
      ...prev,
      features,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category) {
      showAlert(
        "error",
        "Title, price and category are required",
        "Validation Error"
      );
      return;
    }

    if (formData.price < 0) {
      showAlert("error", "Price cannot be negative", "Validation Error");
      return;
    }

    if (formData.stock < 0) {
      showAlert("error", "Stock cannot be negative", "Validation Error");
      return;
    }

    try {
      setSaving(true);
      const response = await authFetch(
        `http://localhost:5000/api/products/listings/${productId}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        showAlert("success", "Listing updated successfully", "Success");
        // Update original data to match new saved data
        setOriginalData(formData);
        navigate(-1);
      } else {
        showAlert("error", data.message || "Failed to update listing", "Error");
      }
    } catch (error) {
      console.error("Update listing error:", error);
      showAlert(
        "error",
        "Network error. Please try again.",
        "Connection Error"
      );
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Loading listing...</span>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <i className="fa-solid fa-exclamation-circle"></i>
          <h3>Listing Not Found</h3>
          <p>
            The listing you're trying to edit doesn't exist or you don't have
            permission to edit it.
          </p>
          <button
            onClick={() => navigate("/my-listings")}
            className={styles.backButton}
          >
            Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Edit Listing"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        hasChanges={hasUnsavedChanges()}
      />

      <div className={styles.container}>
        {/* Back Button */}
        <div className={styles.backSection}>
          <button onClick={openCancelModal} className={styles.backButton}>
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className="fa-solid fa-edit"></i> Edit Listing
          </h1>
          <p className={styles.subtitle}>Update your product listing details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <i className="fa-solid fa-heading"></i> Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter product title"
              required
            />
          </div>

          {/* Price and Category Row */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <i className="fa-solid fa-tag"></i> Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <i className="fa-solid fa-folder"></i> Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <i className="fa-solid fa-boxes-stacked"></i> Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={styles.input}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <i className="fa-solid fa-align-left"></i> Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Describe your product..."
              rows="4"
            />
          </div>

          {/* Image URL */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <i className="fa-solid fa-image"></i> Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image && (
              <div className={styles.imagePreview}>
                <img
                  src={formData.image}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <span>Image Preview</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <i className="fa-solid fa-star"></i> Features (comma separated)
            </label>
            <textarea
              value={formData.features.join(", ")}
              onChange={handleFeaturesChange}
              className={styles.textarea}
              placeholder="Feature 1, Feature 2, Feature 3"
              rows="2"
            />
            <div className={styles.featuresPreview}>
              {formData.features.map((feature, index) => (
                <span key={index} className={styles.featureTag}>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={openCancelModal}
              className={styles.cancelButton}
              disabled={saving}
            >
              <i className="fa-solid fa-times"></i> Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i> Update Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditListing;
