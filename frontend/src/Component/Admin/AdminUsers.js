import React, { useState, useEffect } from "react";
import { useAlert } from "../Context/AlertContext";
import DeleteConfirmationModal from "../Alerts/DeleteConfirmation";
import CancelConfirmationModal from "../Alerts/CancelConfirmation";
import styles from "./AdminUsers.module.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    contact: "",
    country: "",
    isAdmin: false,
    isActive: true,
    password: "",
  });
  const [originalForm, setOriginalForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || data.data || []);
        setFilteredUsers(data.users || data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.includes(searchTerm) ||
        user.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contact?.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      country: user.country || "",
      isAdmin: user.isAdmin || false,
      isActive: user.isActive !== false,
      password: "",
    });
    setOriginalForm({
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      country: user.country || "",
      isAdmin: user.isAdmin || false,
      isActive: user.isActive !== false,
      password: "",
    });
    setIsEditing(false);
    setIsCreating(false);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    const initialForm = {
      name: user.name || "",
      email: user.email || "",
      contact: user.contact || "",
      country: user.country || "",
      isAdmin: user.isAdmin || false,
      isActive: user.isActive !== false,
      password: "",
    };
    setUserForm(initialForm);
    setOriginalForm(initialForm);
    setIsEditing(true);
    setIsCreating(false);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsCreating(true);
    setShowUserModal(true);
    const initialForm = {
      name: "",
      email: "",
      contact: "",
      country: "",
      isAdmin: false,
      isActive: true,
      password: "",
    };
    setUserForm(initialForm);
    setOriginalForm(initialForm);
  };

  const getButtonText = () => {
    if (isSubmitting) return "Processing...";
    if (isEditing) return "Update User";
    if (isCreating) return "Create User";
    return "Submit";
  };

  // Open delete confirmation modal
  const openDeleteModal = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteUser = async () => {
    if (!userToDelete?.id) return;

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        showAlert("success", "User deleted successfully", "Success");
        setShowDeleteModal(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    }
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalForm) return false;
    return JSON.stringify(userForm) !== JSON.stringify(originalForm);
  };

  // Open cancel confirmation modal
  const openCancelModal = () => {
    if (hasUnsavedChanges()) {
      setShowCancelModal(true);
    } else {
      handleCancelConfirm();
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setShowUserModal(false);
    setShowCancelModal(false);
    setUserForm(originalForm);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const requiredFields = ["name", "email", "contact", "country"];
    const missingFields = requiredFields.filter(
      (field) => !userForm[field]?.trim()
    );

    if (missingFields.length > 0) {
      showAlert(
        "failure",
        `Missing required fields: ${missingFields.join(", ")}`,
        "Validation Error"
      );
      return;
    }

    const cleanContact = userForm.contact.replace(/\s/g, "");
    const contactRegex = /^(\+?[0-9]{10,15})$/;

    if (!contactRegex.test(cleanContact)) {
      showAlert(
        "failure",
        "Contact must be 10-15 digits. Can start with + for international numbers.",
        "Validation Error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = isEditing
        ? `${API_BASE_URL}/admin/users/${selectedUser._id}`
        : `${API_BASE_URL}/admin/users`;

      const method = isEditing ? "PUT" : "POST";

      const userData = {
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        contact: cleanContact,
        country: userForm.country,
        isAdmin: userForm.isAdmin,
        isActive: userForm.isActive,
      };

      if (userForm.password && userForm.password.trim()) {
        userData.password = userForm.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.message ||
          data.error?.message ||
          data.errors?.contact ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      if (data.success) {
        const successMsg = `User ${isEditing ? "updated" : "created"} successfully`;
        showAlert("success", successMsg, "Success");

        // if (data.generatedPassword) {
        //   setTimeout(() => {
        //     alert(`${successMsg}\n\nGenerated Password: ${data.generatedPassword}\n\nPlease share this with the user.`);
        //   }, 100);
        // }

        setShowUserModal(false);
        setTimeout(() => fetchUsers(), 500);
        setOriginalForm(userForm);
      } else {
        throw new Error(data.message || "Operation failed");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) return { text: "Inactive", class: styles.statusInactive };
    if (user.isAdmin) return { text: "Admin", class: styles.statusAdmin };
    return { text: "Active", class: styles.statusActive };
  };

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Japan", "China", "India", "Brazil", "Mexico", "Italy",
    "Spain", "Russia", "South Korea", "Saudi Arabia", "UAE", "Pakistan",
    "Bangladesh", "Nigeria", "South Africa", "Egypt", "Turkey", "Netherlands",
    "Switzerland", "Sweden", "Norway", "Denmark", "Finland", "Belgium",
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <i className="fa-solid fa-users fa-spin"></i>
        </div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={userToDelete ? `Are you sure you want to delete "${userToDelete.name}"? This action cannot be undone.` : "Are you sure you want to delete this user?"}
        confirmText="Delete User"
        cancelText="Cancel"
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel User Edit"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        hasChanges={hasUnsavedChanges()}
      />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className="fa-solid fa-users"></i> Users Management
          </h1>
          <p className={styles.subtitle}>
            Manage your platform users and their permissions
          </p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Search users by name, email, country, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchTerm("")}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
          </div>

          <div className={styles.controlButtons}>
            <button className={styles.addButton} onClick={handleCreateUser}>
              <i className="fa-solid fa-user-plus"></i> Add New User
            </button>
            <button className={styles.refreshButton} onClick={fetchUsers}>
              <i className="fa-solid fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(40, 167, 69, 0.2)" }}>
              <i className="fa-solid fa-users" style={{ color: "#28a745" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{users.length}</span>
              <span className={styles.statLabel}>Total Users</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(0, 123, 255, 0.2)" }}>
              <i className="fa-solid fa-user-tie" style={{ color: "#007bff" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {users.filter((u) => u.isAdmin).length}
              </span>
              <span className={styles.statLabel}>Admins</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(108, 117, 125, 0.2)" }}>
              <i className="fa-solid fa-user-slash" style={{ color: "#6c757d" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {users.filter((u) => !u.isActive).length}
              </span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(255, 193, 7, 0.2)" }}>
              <i className="fa-solid fa-globe" style={{ color: "#ffc107" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {new Set(users.map((u) => u.country)).size}
              </span>
              <span className={styles.statLabel}>Countries</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.tableRow}>
              <div className={`${styles.tableCell} ${styles.cellUser}`}>User</div>
              <div className={`${styles.tableCell} ${styles.cellEmail}`}>Email</div>
              <div className={`${styles.tableCell} ${styles.cellContact}`}>Contact</div>
              <div className={`${styles.tableCell} ${styles.cellCountry}`}>Country</div>
              <div className={`${styles.tableCell} ${styles.cellRole}`}>Role</div>
              <div className={`${styles.tableCell} ${styles.cellStatus}`}>Status</div>
              <div className={`${styles.tableCell} ${styles.cellJoined}`}>Joined</div>
              <div className={`${styles.tableCell} ${styles.cellActions}`}>Actions</div>
            </div>
          </div>

          <div className={styles.tableBody}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const status = getStatusBadge(user);
                return (
                  <div key={user._id} className={styles.tableRow}>
                    <div className={`${styles.tableCell} ${styles.cellUser}`}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} />
                          ) : (
                            <i className="fa-solid fa-user"></i>
                          )}
                        </div>
                        <div>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userId}>ID: {user._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellEmail}`}>
                      <a href={`mailto:${user.email}`} className={styles.emailLink}>
                        {user.email}
                      </a>
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellContact}`}>
                      {user.contact || "N/A"}
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellCountry}`}>
                      {user.country || "N/A"}
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellRole}`}>
                      <span className={`${styles.roleBadge} ${user.isAdmin ? styles.roleAdmin : styles.roleUser}`}>
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellStatus}`}>
                      <span className={`${styles.statusBadge} ${status.class}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellJoined}`}>
                      {formatDate(user.createdAt || new Date())}
                    </div>
                    <div className={`${styles.tableCell} ${styles.cellActions}`}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.viewButton}
                          onClick={() => handleViewUser(user)}
                          title="View Details"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => openDeleteModal(user._id, user.name)}
                          title="Delete User"
                          disabled={user.isAdmin}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noData}>
                <i className="fa-solid fa-users-slash"></i>
                <p>No users found</p>
                {searchTerm && <p>Try a different search term</p>}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button className={styles.pageButton} disabled>
            <i className="fa-solid fa-chevron-left"></i> Previous
          </button>
          <span className={styles.pageInfo}>
            Showing 1-{filteredUsers.length} of {users.length} users
          </span>
          <button className={styles.pageButton}>
            Next <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              if (!isSubmitting) {
                openCancelModal();
              }
            }}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  <i className="fa-solid fa-user"></i>
                  {isCreating
                    ? "Add New User"
                    : isEditing
                    ? "Edit User"
                    : "User Details"}
                </h3>
                <button
                  className={styles.modalClose}
                  onClick={openCancelModal}
                  disabled={isSubmitting}
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className={styles.modalBody}>
                {selectedUser && !isEditing && !isCreating ? (
                  // View Mode
                  <div className={styles.userDetails}>
                    <div className={styles.detailAvatar}>
                      {selectedUser.profileImage ? (
                        <img src={selectedUser.profileImage} alt={selectedUser.name} />
                      ) : (
                        <i className="fa-solid fa-user-circle"></i>
                      )}
                    </div>
                    <div className={styles.detailInfo}>
                      <div className={styles.detailRow}>
                        <strong>Name:</strong>
                        <span>{selectedUser.name}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Email:</strong>
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Contact:</strong>
                        <span>{selectedUser.contact || "Not provided"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Country:</strong>
                        <span>{selectedUser.country || "Not provided"}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Role:</strong>
                        <span className={`${styles.roleBadge} ${selectedUser.isAdmin ? styles.roleAdmin : styles.roleUser}`}>
                          {selectedUser.isAdmin ? "Administrator" : "Regular User"}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Status:</strong>
                        <span className={`${styles.statusBadge} ${getStatusBadge(selectedUser).class}`}>
                          {getStatusBadge(selectedUser).text}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Joined:</strong>
                        <span>{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Last Login:</strong>
                        <span>
                          {selectedUser.lastLogin
                            ? formatDate(selectedUser.lastLogin)
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit/Create Mode
                  <form onSubmit={handleFormSubmit} className={styles.userForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">
                        <i className="fa-solid fa-user"></i> Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userForm.name}
                        onChange={handleFormChange}
                        required
                        minLength="2"
                        maxLength="50"
                        className={styles.formInput}
                        placeholder="Enter full name"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">
                        <i className="fa-solid fa-envelope"></i> Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userForm.email}
                        onChange={handleFormChange}
                        required
                        className={styles.formInput}
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="contact">
                        <i className="fa-solid fa-phone"></i> Contact Number *
                      </label>
                      <input
                        type="text"
                        id="contact"
                        name="contact"
                        value={userForm.contact}
                        onChange={handleFormChange}
                        required
                        className={styles.formInput}
                        placeholder="Enter contact number"
                        disabled={isSubmitting}
                      />
                      <p className={styles.helperText}>
                        Enter phone number with optional country code (+)
                      </p>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="country">
                        <i className="fa-solid fa-globe"></i> Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={userForm.country}
                        onChange={handleFormChange}
                        required
                        className={styles.formInput}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Country</option>
                        {countries.map((country, index) => (
                          <option key={index} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="password">
                        <i className="fa-solid fa-lock"></i> Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={userForm.password}
                        onChange={handleFormChange}
                        minLength="6"
                        className={styles.formInput}
                        placeholder="Enter password (optional, auto-generated if empty)"
                        disabled={isSubmitting}
                      />
                      <p className={styles.helperText}>
                        {isEditing
                          ? "Leave empty to keep current password"
                          : "Leave empty to auto-generate a secure password"}
                      </p>
                    </div>

                    <div className={styles.formCheckboxes}>
                      <div className={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          id="isAdmin"
                          name="isAdmin"
                          checked={userForm.isAdmin}
                          onChange={handleFormChange}
                          className={styles.checkboxInput}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="isAdmin" className={styles.checkboxLabel}>
                          <i className="fa-solid fa-crown"></i> Administrator Privileges
                        </label>
                      </div>

                      <div className={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={userForm.isActive}
                          onChange={handleFormChange}
                          className={styles.checkboxInput}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="isActive" className={styles.checkboxLabel}>
                          <i className="fa-solid fa-check-circle"></i> Active Account
                        </label>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        className={styles.saveButton}
                        disabled={isSubmitting}
                      >
                        <i className="fa-solid fa-save"></i> {getButtonText()}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={openCancelModal}
                        disabled={isSubmitting}
                      >
                        <i className="fa-solid fa-times"></i> Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {selectedUser && !isEditing && !isCreating && (
                <div className={styles.modalFooter} style={{padding:"5px"}}>
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditing(true)}
                    style={{background:"none",color:"green"}}
                  >
                    <i className="fa-solid fa-edit"></i>Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;