import React, { useState, useEffect } from "react";
import { useAlert } from "../context/AlertContext";
import DeleteConfirmationModal from "../DeleteConfirmation/DeleteConfirmation";
import CancelConfirmationModal from "../CancelConfirmation/CancelConfirmation";
import styles from "./AdminProducts.module.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    featured: false,
    status: "active",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([
    "Electronics",
    "Clothing",
    "Books",
    "Home",
    "Sports",
    "Other",
  ]);
  const [currentCategory, setCurrentCategory] = useState("all");

  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products, currentCategory]);

  const fetchProducts = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.products || data.data || []);
        setFilteredProducts(data.products || data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (currentCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === currentCategory.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product._id?.includes(searchTerm)
      );
    }

    setFilteredProducts(filtered);
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!originalForm) return false;
    return JSON.stringify(productForm) !== JSON.stringify(originalForm);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    const initialForm = {
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      stock: product.stock || "",
      image: product.image || product.images?.[0] || "",
      featured: product.featured || false,
      status: product.status || "active",
    };
    setProductForm(initialForm);
    setOriginalForm(initialForm);
    setIsEditing(false);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    const initialForm = {
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      stock: product.stock || "",
      image: product.image || product.images?.[0] || "",
      featured: product.featured || false,
      status: product.status || "active",
    };
    setProductForm(initialForm);
    setOriginalForm(initialForm);
    setIsEditing(true);
    setShowProductModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (productId, productName) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteProduct = async () => {
    if (!productToDelete?.id) return;

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/products/${productToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        showAlert("success", "Product deleted successfully", "Success");
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        throw new Error(data.message || "Failed to delete product");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    }
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
    setShowProductModal(false);
    setShowCancelModal(false);
    setProductForm(originalForm);
    setIsEditing(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const url = isEditing
        ? `${API_BASE_URL}/admin/products/${selectedProduct._id}`
        : `${API_BASE_URL}/admin/products`;
      // console.log(isEditing);
      const method = isEditing ? "PUT" : "POST";

      const formData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        showAlert(
          "success",
          `Product ${isEditing ? "updated" : "created"} successfully`,
          "Success"
        );
        setShowProductModal(false);
        setOriginalForm(formData);
        fetchProducts();
      } else {
        throw new Error(
          data.message || `Failed to ${isEditing ? "update" : "create"} product`
        );
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", class: styles.stockOut };
    if (stock < 10) return { text: "Low Stock", class: styles.stockLow };
    return { text: "In Stock", class: styles.stockIn };
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { text: "Active", class: styles.statusActive };
      case "inactive":
        return { text: "Inactive", class: styles.statusInactive };
      case "draft":
        return { text: "Draft", class: styles.statusDraft };
      default:
        return { text: "Active", class: styles.statusActive };
    }
  };

  const handleCategoryFilter = (category) => {
    setCurrentCategory(category);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <i className="fa-solid fa-boxes fa-spin"></i>
        </div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this product?"
        }
        confirmText="Delete Product"
        cancelText="Cancel"
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Product Edit"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        hasChanges={hasUnsavedChanges()}
      />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className="fa-solid fa-box"></i> Products Management
          </h1>
          <p className={styles.subtitle}>
            Manage your product catalog and inventory
          </p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Search products by name, description, or ID..."
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
            <button
              className={styles.addButton}
              onClick={() => {
                setSelectedProduct(null);
                const initialForm = {
                  name: "",
                  description: "",
                  price: "",
                  category: "",
                  stock: "",
                  image: "",
                  featured: false,
                  status: "active",
                };
                setProductForm(initialForm);
                setOriginalForm(initialForm);
                setIsEditing(false);
                setShowProductModal(true);
              }}
            >
              <i className="fa-solid fa-plus"></i> Add New Product
            </button>
            <button className={styles.refreshButton} onClick={fetchProducts}>
              <i className="fa-solid fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className={styles.categoryFilters}>
          <div className={styles.categoryList}>
            <button
              className={`${styles.categoryButton} ${
                currentCategory === "all" ? styles.active : ""
              }`}
              onClick={() => handleCategoryFilter("all")}
            >
              <i className="fa-solid fa-layer-group"></i> All Products
              <span className={styles.categoryCount}>{products.length}</span>
            </button>

            {categories.map((category, index) => {
              const count = products.filter(
                (p) => p.category?.toLowerCase() === category.toLowerCase()
              ).length;
              return (
                <button
                  key={index}
                  className={`${styles.categoryButton} ${
                    currentCategory === category.toLowerCase()
                      ? styles.active
                      : ""
                  }`}
                  onClick={() => handleCategoryFilter(category.toLowerCase())}
                >
                  <i className="fa-solid fa-tag"></i> {category}
                  <span className={styles.categoryCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(0, 123, 255, 0.2)" }}
            >
              <i className="fa-solid fa-boxes" style={{ color: "#007bff" }}></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{products.length}</span>
              <span className={styles.statLabel}>Total Products</span>
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
              <span className={styles.statValue}>
                {products.filter((p) => p.stock > 10).length}
              </span>
              <span className={styles.statLabel}>In Stock</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(255, 193, 7, 0.2)" }}
            >
              <i
                className="fa-solid fa-exclamation-triangle"
                style={{ color: "#ffc107" }}
              ></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {products.filter((p) => p.stock > 0 && p.stock < 10).length}
              </span>
              <span className={styles.statLabel}>Low Stock</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "rgba(220, 53, 69, 0.2)" }}
            >
              <i
                className="fa-solid fa-times-circle"
                style={{ color: "#dc3545" }}
              ></i>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {products.filter((p) => p.stock === 0).length}
              </span>
              <span className={styles.statLabel}>Out of Stock</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const status = getStatusBadge(product.status);
              return (
                <div key={product._id} className={styles.productCard}>
                  {/* Product Image */}
                  <div className={styles.productImage}>
                    {product.image || product.images?.[0] ? (
                      <img
                        src={product.image || product.images[0]}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50' y='50' font-size='12' text-anchor='middle' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <i className="fa-solid fa-image"></i>
                        <span>No Image</span>
                      </div>
                    )}
                    {product.featured && (
                      <div className={styles.featuredBadge}>
                        <i className="fa-solid fa-star"></i> Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                      <h3 className={styles.productName} title={product.name}>
                        {product.name}
                      </h3>
                      <span className={styles.productPrice}>
                        {formatCurrency(product.price || 0)}
                      </span>
                    </div>

                    <p className={styles.productDescription}>
                      {product.description?.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description || "No description"}
                    </p>

                    <div className={styles.productMeta}>
                      <div className={styles.metaItem}>
                        <i className="fa-solid fa-tag"></i>
                        <span className={styles.metaValue}>
                          {product.category || "Uncategorized"}
                        </span>
                      </div>
                      <div className={styles.metaItem}>
                        <i className="fa-solid fa-layer-group"></i>
                        <span className={styles.metaValue}>
                          ID: {product._id?.slice(-6)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.productFooter}>
                      <div className={styles.productStatus}>
                        <span
                          className={`${styles.stockBadge} ${stockStatus.class}`}
                        >
                          <i className="fa-solid fa-box"></i> {product.stock}{" "}
                          units
                        </span>
                        <span
                          className={`${styles.statusBadge} ${status.class}`}
                        >
                          {status.text}
                        </span>
                      </div>

                      <div className={styles.productActions}>
                        <button
                          className={styles.viewButton}
                          onClick={() => handleViewProduct(product)}
                          title="View Details"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditProduct(product)}
                          title="Edit Product"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() =>
                            openDeleteModal(product._id, product.name)
                          }
                          title="Delete Product"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.noData}>
              <i className="fa-solid fa-box-open"></i>
              <p>No products found</p>
              {searchTerm && <p>Try a different search term</p>}
              {currentCategory !== "all" && <p>Try selecting "All Products"</p>}
            </div>
          )}
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className={styles.modalOverlay} onClick={openCancelModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  <i className="fa-solid fa-box"></i>
                  {isEditing
                    ? "Edit Product"
                    : selectedProduct
                    ? "Product Details"
                    : "Add New Product"}
                </h3>
                <button className={styles.modalClose} onClick={openCancelModal}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className={styles.modalBody}>
                {selectedProduct && !isEditing ? (
                  // View Mode
                  <div className={styles.productDetails}>
                    <div className={styles.detailImage}>
                      {selectedProduct.image || selectedProduct.images?.[0] ? (
                        <img
                          src={
                            selectedProduct.image || selectedProduct.images[0]
                          }
                          alt={selectedProduct.name}
                        />
                      ) : (
                        <div className={styles.detailNoImage}>
                          <i className="fa-solid fa-image fa-3x"></i>
                          <span>No Image Available</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.detailInfo}>
                      <div className={styles.detailRow}>
                        <strong>Product Name:</strong>
                        <span>{selectedProduct.name}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Price:</strong>
                        <span className={styles.detailPrice}>
                          {formatCurrency(selectedProduct.price)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Category:</strong>
                        <span className={styles.detailCategory}>
                          {selectedProduct.category || "Uncategorized"}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Stock:</strong>
                        <span
                          className={`${styles.detailStock} ${
                            getStockStatus(selectedProduct.stock).class
                          }`}
                        >
                          {selectedProduct.stock} units
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Status:</strong>
                        <span
                          className={`${styles.detailStatus} ${
                            getStatusBadge(selectedProduct.status).class
                          }`}
                        >
                          {getStatusBadge(selectedProduct.status).text}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Featured:</strong>
                        <span>
                          {selectedProduct.featured ? (
                            <i className="fa-solid fa-check text-success"></i>
                          ) : (
                            <i className="fa-solid fa-times text-danger"></i>
                          )}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Product ID:</strong>
                        <span className={styles.detailId}>
                          {selectedProduct._id}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <strong>Description:</strong>
                        <div className={styles.detailDescription}>
                          {selectedProduct.description ||
                            "No description available"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit/Create Mode
                  <form
                    onSubmit={handleFormSubmit}
                    className={styles.productForm}
                  >
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="name">
                          <i className="fa-solid fa-tag"></i> Product Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={productForm.name}
                          onChange={handleFormChange}
                          required
                          className={styles.formInput}
                          placeholder="Enter product name"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="price">
                          <i className="fa-solid fa-dollar-sign"></i> Price *
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={productForm.price}
                          onChange={handleFormChange}
                          required
                          min="0"
                          step="0.01"
                          className={styles.formInput}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="category">
                          <i className="fa-solid fa-tags"></i> Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={productForm.category}
                          onChange={handleFormChange}
                          className={styles.formSelect}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat, index) => (
                            <option key={index} value={cat.toLowerCase()}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="stock">
                          <i className="fa-solid fa-box"></i> Stock *
                        </label>
                        <input
                          type="number"
                          id="stock"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleFormChange}
                          required
                          min="0"
                          className={styles.formInput}
                          placeholder="Enter stock quantity"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="description">
                        <i className="fa-solid fa-align-left"></i> Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={productForm.description}
                        onChange={handleFormChange}
                        rows="4"
                        className={styles.formTextarea}
                        placeholder="Enter product description"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="image">
                        <i className="fa-solid fa-image"></i> Image URL
                      </label>
                      <input
                        type="url"
                        id="image"
                        name="image"
                        value={productForm.image}
                        onChange={handleFormChange}
                        className={styles.formInput}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="status">
                          <i className="fa-solid fa-circle"></i> Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={productForm.status}
                          onChange={handleFormChange}
                          className={styles.formSelect}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div className={styles.formCheckboxes}>
                        <div className={styles.checkboxGroup}>
                          <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={productForm.featured}
                            onChange={handleFormChange}
                            className={styles.checkboxInput}
                          />
                          <label
                            htmlFor="featured"
                            className={styles.checkboxLabel}
                          >
                            <i className="fa-solid fa-star"></i> Featured
                            Product
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className={styles.saveButton}>
                        <i className="fa-solid fa-save"></i>{" "}
                        {isEditing ? "Update Product" : "Create Product"}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={openCancelModal}
                      >
                        <i className="fa-solid fa-times"></i> Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {selectedProduct && !isEditing && (
                <div className={styles.modalFooter}>
                  <button
                    className={`${styles.editButton} ${styles.editButtonProductDetail}`}
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fa-solid fa-edit"></i> Edit Product
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

export default AdminProducts;
