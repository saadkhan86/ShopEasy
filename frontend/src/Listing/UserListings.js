import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth, useAuthFetch } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import DeleteConfirmationModal from "../DeleteConfirmation/DeleteConfirmation";
import styles from "./UserListings.module.css";

const UserListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    listingId: null,
    listingTitle: "",
  });

  const { user, token, isAuthenticated, getAuthHeaders } = useAuth();
  const authFetch = useAuthFetch();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // Fetch user's listings
  const fetchListings = async (pageNum = 1) => {
    if (!isAuthenticated || !token) {
      showAlert(
        "error",
        "Please login to view your listings",
        "Authentication Required"
      );
      navigate("/login");
      return;
    }

    try {
      console.log("fetching user's listing");
      setLoading(true);
      const response = await authFetch(
        `http://localhost:5000/api/products/listings/my-listings?page=${pageNum}&limit=10&status=${filter}`
      );
      const data = await response.json();
      console.log(data);
      if (data.success) {
        if (pageNum === 1) {
          setListings(data.listings || []);
        } else {
          setListings((prev) => [...prev, ...(data.listings || [])]);
        }
        setHasMore((data.listings || []).length > 0);
        setPage(pageNum);
      } else {
        showAlert("error", data.message || "Failed to fetch listings", "Error");
      }
    } catch (error) {
      console.error("Fetch listings error:", error);
      showAlert(
        "error",
        "Network error. Please try again.",
        "Connection Error"
      );
    } finally {
      setLoading(false);
    }
  };
  const getTruncatedDescription = (description) => {
    if (!description) return "No description provided";
    if (description.length > 80) {
      return `${description.substring(0, 80)}...`;
    }
    return description;
  };

  // Load more listings
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchListings(page + 1);
    }
  };

  // Handle status filter change
  const handleFilterChange = (status) => {
    setFilter(status);
    setPage(1);
  };

  // Open delete confirmation modal
  const openDeleteModal = (listingId, listingTitle) => {
    setDeleteModal({
      isOpen: true,
      listingId,
      listingTitle,
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      listingId: null,
      listingTitle: "",
    });
  };

  // Handle delete listing
  const handleDeleteListing = async () => {
    if (!deleteModal.listingId) return;

    try {
      const response = await authFetch(
        `http://localhost:5000/api/products/listings/${deleteModal.listingId}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.success) {
        showAlert("success", "Listing deleted successfully", "Success");
        setListings(
          listings.filter((listing) => listing._id !== deleteModal.listingId)
        );
        closeDeleteModal();
      } else {
        showAlert("error", data.message || "Failed to delete listing", "Error");
      }
    } catch (error) {
      console.error("Delete listing error:", error);
      showAlert(
        "error",
        "Network error. Please try again.",
        "Connection Error"
      );
    }
  };

  // Handle status update
  const handleStatusUpdate = async (listingId, newStatus) => {
    try {
      const response = await authFetch(
        `http://localhost:5000/api/products/listings/${listingId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();

      if (data.success) {
        showAlert(
          "success",
          `Listing status updated to ${newStatus}`,
          "Success"
        );
        setListings(
          listings.map((listing) =>
            listing._id === listingId
              ? { ...listing, status: newStatus }
              : listing
          )
        );
      } else {
        showAlert("error", data.message || "Failed to update status", "Error");
      }
    } catch (error) {
      console.error("Update status error:", error);
      showAlert(
        "error",
        "Network error. Please try again.",
        "Connection Error"
      );
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchListings();
    }
  }, [filter, isAuthenticated]);

  if (!isAuthenticated && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <i className="fa-solid fa-lock"></i>
          <h3>Authentication Required</h3>
          <p>Please login to view your listings</p>
          <button
            onClick={() => navigate("/login")}
            className={styles.loginButton}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && listings.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Loading your listings...</span>
        </div>
      </div>
    );
  }

  // Find the listing being deleted for modal message
  const listingToDelete = deleteModal.listingId
    ? listings.find((l) => l._id === deleteModal.listingId)
    : null;

  return (
    <>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteListing}
        title="Delete Listing"
        message={
          listingToDelete
            ? `Are you sure you want to delete "${listingToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this listing? This action cannot be undone."
        }
        confirmText="Delete Listing"
        cancelText="Cancel"
      />

      <div className={styles.container}>
        <i
          className={`fa-solid fa-arrow-left ${styles.backArrow}`}
          onClick={() => navigate(-1)}
        ></i>

        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <i className="fa-solid fa-store"></i> My Listings
            </h1>
            <p className={styles.subtitle}>
              Manage all your product listings in one place
            </p>
          </div>

          {/* Create Listing Button */}
          <Link
            to={`/listings/${user._id}/create`}
            className={styles.createButton}
          >
            <i className="fa-solid fa-plus"></i> Create New Listing
          </Link>
        </div>

        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Listings</span>
              <span className={styles.statValue}>{listings.length}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(40, 167, 69, 0.2)" }}
            >
              <i
                className="fa-solid fa-check-circle"
                style={{ color: "#28a745" }}
              ></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Active</span>
              <span className={styles.statValue}>
                {listings.filter((l) => l.status === "active").length}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(255, 193, 7, 0.2)" }}
            >
              <i className="fa-solid fa-clock" style={{ color: "#ffc107" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Pending</span>
              <span className={styles.statValue}>
                {listings.filter((l) => l.status === "pending").length}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(108, 117, 125, 0.2)" }}
            >
              <i className="fa-solid fa-tag" style={{ color: "#6c757d" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Sold</span>
              <span className={styles.statValue}>
                {listings.filter((l) => l.status === "sold").length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("all")}
          >
            <i className="fa-solid fa-layer-group"></i> All Listings
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "active" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("active")}
          >
            <i className="fa-solid fa-check-circle"></i> Active
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "pending" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("pending")}
          >
            <i className="fa-solid fa-clock"></i> Pending
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "sold" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("sold")}
          >
            <i className="fa-solid fa-tag"></i> Sold
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "inactive" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("inactive")}
          >
            <i className="fa-solid fa-pause-circle"></i> Inactive
          </button>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-inbox"></i>
            <h3>No Listings Found</h3>
            <p>
              You haven't created any listings yet. Start by creating your first
              product!
            </p>
            <Link
              to={`/listings/${user._id}/create`}
              className={styles.createFirstButton}
            >
              <i className="fa-solid fa-plus"></i> Create Your First Listing
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.listingsGrid}>
              {listings.map((listing) => (
                <div key={listing._id} className={styles.listingCard}>
                  {/* Status Badge */}
                  <div
                    className={`${styles.statusBadge} ${
                      styles[listing.status]
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        listing.status === "active"
                          ? "fa-check-circle"
                          : listing.status === "pending"
                          ? "fa-clock"
                          : listing.status === "sold"
                          ? "fa-tag"
                          : "fa-pause-circle"
                      }`}
                    ></i>
                    <span>
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </span>
                  </div>

                  {/* Listing Image */}
                  <div className={styles.listingImage}>
                    {listing.image ? (
                      <img
                        src={listing.image}
                        alt={listing.title}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="${styles.noImage}">
                              <i class="fa-solid fa-image"></i>
                              <span>No Image</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <i className="fa-solid fa-image"></i>
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div className={styles.listingDetails}>
                    <h3 className={styles.listingTitle}>{listing.title}</h3>
                    <div className={styles.listingCategory}>
                      <i className="fa-solid fa-tag"></i>
                      <span>{listing.category}</span>
                    </div>
                    <p className={styles.listingDescription}>
                      {getTruncatedDescription(listing.description)}
                    </p>

                    {/* Price and Stock */}
                    <div className={styles.listingInfo}>
                      <div className={styles.listingPrice}>
                        <i className="fa-solid fa-tag"></i>
                        <span>${listing.price?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className={styles.listingStock}>
                        <i className="fa-solid fa-boxes-stacked"></i>
                        <span>{listing.stock || 0} in stock</span>
                      </div>
                    </div>

                    {/* Features */}
                    {listing.features && listing.features.length > 0 && (
                      <div className={styles.listingFeatures}>
                        {listing.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className={styles.featureTag}>
                            {feature}
                          </span>
                        ))}
                        {listing.features.length > 3 && (
                          <span className={styles.moreFeatures}>
                            +{listing.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Created Date */}
                    <div className={styles.listingDate}>
                      <i className="fa-solid fa-calendar"></i>
                      <span>
                        Created:{" "}
                        {listing.createdAt
                          ? new Date(listing.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actionButtons}>
                    {/* View Button */}
                    <button
                      className={styles.viewButton}
                      onClick={() => navigate(`/product/${listing._id}`)}
                    >
                      <i className="fa-solid fa-eye"></i> View
                    </button>

                    {/* Edit Button */}
                    <button
                      className={styles.editButton}
                      onClick={() => navigate(`/edit-listing/${listing._id}`)}
                    >
                      <i className="fa-solid fa-edit"></i> Edit
                    </button>

                    {/* Status Dropdown */}
                    <div className={styles.statusDropdown}>
                      <select
                        value={listing.status}
                        onChange={(e) =>
                          handleStatusUpdate(listing._id, e.target.value)
                        }
                        className={styles.statusSelect}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Delete Button */}
                    <button
                      className={styles.deleteButton}
                      onClick={() =>
                        openDeleteModal(listing._id, listing.title)
                      }
                    >
                      <i className="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={loadMore}
                  className={styles.loadMoreButton}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Loading...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-arrow-down"></i> Load More
                      Listings
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UserListings;
