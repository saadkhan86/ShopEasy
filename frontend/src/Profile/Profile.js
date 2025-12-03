import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import styles from "./Profile.module.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // In your Profile component's fetchUserProfile function:
  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        showAlert(
          "failure",
          "Please log in to view your profile.",
          "Authentication Required"
        );
        navigate("/login");
        return;
      }

      // GET request to /profile with Bearer token
      const response = await fetch(`http://localhost:5000/api/auth/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          showAlert(
            "failure",
            "Session expired. Please log in again.",
            "Authentication Error"
          );
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      // console.log(data);
      if (data.success) {
        // console.log(data.user.cart.length);
        setUser(data.user);
        setEditForm(data.user);

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.message || "Failed to load profile");
      }
    } catch (error) {
      // console.error("Error fetching profile:", error);
      showAlert(
        "failure",
        "Error loading profile data. Please try again.",
        "Profile Error"
      );

      // Fallback to localStorage data
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setEditForm(parsedUser);
        } catch (parseError) {
          // console.error("Error parsing localStorage data:", parseError);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // In handleSave function:
  const handleSave = async () => {
    // Validate form before saving
    if (!editForm.name?.trim()) {
      showAlert("failure", "Please enter your name.", "Validation Error");
      return;
    }

    if (!editForm.email?.trim()) {
      showAlert(
        "failure",
        "Please enter your email address.",
        "Validation Error"
      );
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showAlert(
          "failure",
          "Authentication token not found.",
          "Authentication Error"
        );
        setSaving(false);
        return;
      }

      // Send PATCH request to update user profile
      const response = await fetch(`http://localhost:5000/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          country: editForm.country || "",
          contact: editForm.contact || "",
          // Note: email is NOT included as it cannot be changed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          showAlert(
            "failure",
            "Session expired. Please log in again.",
            "Authentication Error"
          );
          navigate("/login");
          return;
        }
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsEditing(false);

        showAlert("success", "Profile updated successfully!", "Profile Saved");
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      // console.error("Error updating profile:", error);
      showAlert(
        "failure",
        error.message || "Failed to update profile. Please try again.",
        "Update Error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    showAlert("success", "You have been logged out successfully.", "Goodbye!");
    navigate("/");
  };

  const handleEdit = () => {
    setIsEditing(true);
    showAlert(
      "success",
      "You can now edit your profile information.",
      "Edit Mode"
    );
  };
  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
    showAlert("failure", "Profile editing cancelled.", "Edit Cancelled");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Show informative alerts when switching tabs
    switch (tab) {
      case "profile":
        showAlert("success", "Viewing your personal information.", "Profile");
        break;
      case "activity":
        showAlert("success", "Viewing your recent activity.", "Activity");
        break;
      case "settings":
        showAlert("success", "Managing your account settings.", "Settings");
        break;
      default:
        break;
    }
  };

  const handleUploadClick = () => {
    showAlert(
      "success",
      "Profile picture upload feature would be implemented here.",
      "Upload Feature"
    );
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>No Profile Data</h1>
          <p className={styles.subtitle}>
            Unable to load your profile. Please try logging in again.
          </p>
          <button onClick={() => navigate("/login")} className={styles.btn}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Animated Background */}
      <div className={styles.animatedBackground}>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
        <div className={styles.bubble}></div>
      </div>

      <div className={styles.profileCard}>
        {/* Header Section */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" />
              ) : (
                <span className={styles.avatarInitials}>
                  {getInitials(user.name)}
                </span>
              )}
              <div className={styles.avatarGlow}></div>
            </div>
            <div className={styles.uploadOverlay} onClick={handleUploadClick}>
              <i className="fas fa-camera"></i>
            </div>
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.userName}>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name || ""}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  placeholder="Enter your full name"
                />
              ) : (
                user.name || "No Name"
              )}
            </h1>
            <p className={styles.userEmail}>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ""}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  placeholder="Enter your email address"
                />
              ) : (
                user.email || "No Email"
              )}
            </p>
            <p className={styles.memberSince}>
              <i className="fas fa-calendar"></i>
              Member since{" "}
              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className={styles.editBtn} onClick={handleEdit}>
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tab} ${
              activeTab === "profile" ? styles.active : ""
            }`}
            onClick={() => handleTabChange("profile")}
          >
            <i className="fas fa-user"></i>
            Profile
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "activity" ? styles.active : ""
            }`}
            onClick={() => handleTabChange("activity")}
          >
            <i className="fas fa-chart-line"></i>
            Activity
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => handleTabChange("settings")}
          >
            <i className="fas fa-cog"></i>
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === "profile" && (
            <div className={styles.tabPane}>
              <h3>Personal Information</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p>{user.name || "Not provided"}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ""}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <p>{user.email || "Not provided"}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>Contact</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="contact"
                      value={editForm.contact || ""}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Add Contact number"
                    />
                  ) : (
                    <p>{user.contact || "Not provided"}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="country"
                      value={editForm.country || ""}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="Add Country"
                    />
                  ) : (
                    <p>{user.country || user.country || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className={styles.statsGrid}>
                <div
                  className={`${styles.statCard} ${styles.cartButton}`}
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                  }}
                >
                  <div className={styles.statIcon}>
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{user.cart?.length || 0}</h3>
                    <p>Cart Items</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>{user.emailVerified ? "Verified" : "Pending"}</h3>
                    <p>Email Status</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className={styles.tabPane}>
              <h3>Recent Activity</h3>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <div className={styles.activityContent}>
                    <p>Placed a new order</p>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <i className="fas fa-star"></i>
                  </div>
                  <div className={styles.activityContent}>
                    <p>Reviewed a product</p>
                    <span>3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className={styles.tabPane}>
              <h3>Account Settings</h3>
              <div className={styles.settingsList}>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4>Email Notifications</h4>
                    <p>Receive updates about your orders and promotions</p>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h4>Privacy Mode</h4>
                    <p>Hide your activity from other users</p>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
