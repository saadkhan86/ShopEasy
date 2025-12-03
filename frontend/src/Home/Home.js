import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import styles from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom";

// Memoized Image Component to prevent unnecessary re-renders
const ProductImage = React.memo(({ src, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <>
      <img
        src={
          imageError ? "https://via.placeholder.com/300x300?text=No+Image" : src
        }
        alt={alt}
        className={`${className} ${imageLoaded ? styles.imageLoaded : ""}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {!imageLoaded && !imageError && (
        <div className={styles.imagePlaceholder}>Loading...</div>
      )}
    </>
  );
});

function Home() {
  const [isUserExist, setIsUserExist] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState(["all"]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { showAlert } = useAlert();
  const observerTarget = useRef(null);
  const navigate = useNavigate();

  // Your backend API base URL
  const API_BASE_URL = "http://localhost:5000/api";

  // Check if user exists in localStorage
  const checkUserSaved = () => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      setIsUserExist(true);
    } else {
      setIsUserExist(false);
    }
  };

  // Initialize sample products in YOUR backend
  const initializeProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/init-products`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        showAlert("success", "Sample products initialized successfully!");
        fetchProducts(); // Refresh products
      }
    } catch (err) {
      showAlert("failure", "Failed to initialize sample products.");
    }
  };

  const fetchProducts = useCallback(
    async (
      query = "",
      page = 1,
      isLoadMore = false,
      showSuccessAlert = true
    ) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        // Build query parameters for YOUR backend
        const params = new URLSearchParams();
        if (query) params.append("search", query);
        if (selectedCategory !== "all")
          params.append("category", selectedCategory);

        // For initial load, don't use pagination to get all products
        if (isLoadMore) {
          params.append("page", page);
          params.append("limit", "12");
        } else {
          params.append("limit", "50");
        }

        const url = `${API_BASE_URL}/products?${params}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(
            `Something went wrong while fetching products: ${res.status}`
          );
        }

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch products");
        }

        // FIX: Check if data.data exists and has products
        if (!data.data || data.data.length === 0) {
          if (isLoadMore) {
            // For load more, if no data returned, set hasMore to false
            setHasMore(false);
            if (showSuccessAlert) {
              showAlert("info", "No more products to load.", "End of Results");
            }
          } else {
            // For initial load, if no data, show appropriate message
            setProducts([]);
            setHasMore(false);
            if (showSuccessAlert) {
              showAlert(
                "info",
                "No products found. Try a different search or category."
              );
            }
          }
          return;
        }
        if (isLoadMore) {
          setProducts((prev) => {
            const newProducts = data.data.filter(
              (newProduct) =>
                !prev.some(
                  (existingProduct) => existingProduct._id === newProduct._id
                )
            );

            // If no new products were added, stop infinite scroll
            if (newProducts.length === 0) {
              setHasMore(false);
              if (showSuccessAlert) {
                showAlert(
                  "info",
                  "No more products to load.",
                  "End of Results"
                );
              }
            }

            return [...prev, ...newProducts];
          });

          const hasMoreProducts = page < (data.totalPages || 1);
          setHasMore(hasMoreProducts);
        } else {
          setProducts(data.data);
          const hasMoreProducts =
            data.data && data.totalPages && page < data.totalPages;
          setHasMore(!!hasMoreProducts);

          // Show success alert for initial load only once
          if (data.data.length > 0 && showSuccessAlert && !hasInitialLoad) {
            // showAlert("success", `Loaded products successfully!`);
            setHasInitialLoad(true);
          }
        }
      } catch (err) {
        const errorMessage =
          err.message || "Something went wrong. Please try again.";
        setError(errorMessage);

        // Show error alert
        if (showSuccessAlert) {
          showAlert("failure", errorMessage, "Failed to Load Products");
        }

        // Reset products on error
        if (!isLoadMore) {
          setProducts([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, showAlert, hasInitialLoad]
  );

  // Fetch categories from YOUR backend
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products?limit=50`);
      const data = await res.json();

      if (data.success) {
        const uniqueCategories = [
          "all",
          ...new Set(data.data.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      showAlert("failure", "Failed to load categories.");
    }
  }, [showAlert]);

  // Initial load - only run once
  useEffect(() => {
    checkUserSaved();
    fetchCategories();

    const checkAndInitialize = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products?limit=1`);
        const data = await res.json();

        if (data.success && (data.data.length === 0 || !data.data)) {
          showAlert("info", "Initializing sample products...", "Setting Up");
          await initializeProducts();
        } else {
          // Only fetch products if we don't need to initialize
          fetchProducts(searchQuery, 1, false, true);
        }
      } catch (err) {
        showAlert("failure", "Failed to check products database.");
        // Still try to fetch products even if check fails
        fetchProducts(searchQuery, 1, false, true);
      }
    };

    checkAndInitialize();
  }, []); // Empty dependency array to run only once

  // Load when category changes
  useEffect(() => {
    if (hasInitialLoad) {
      setCurrentPage(1);
      setHasMore(true);
      fetchProducts(searchQuery, 1, false, false); // Don't show success alert for category changes
    }
  }, [selectedCategory, searchQuery]); // Remove fetchProducts from dependencies

  // Fixed Infinite scroll observer
  useEffect(() => {
    if (loadingMore || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchProducts(searchQuery, nextPage, true, false); // Don't show success alert for infinite scroll
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadingMore, loading, hasMore, currentPage, searchQuery]); // Remove fetchProducts from dependencies

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("search")?.trim() || "";

    if (query === searchQuery && products.length > 0) return;

    setSearchQuery(query);
    setCurrentPage(1);
    setHasMore(true);

    if (query) {
      showAlert("info", `Searching for "${query}"...`);
    } else {
      showAlert("info", "Showing all products...");
    }

    fetchProducts(query, 1, false, false); // Don't show success alert for searches
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    showAlert(
      "info",
      `Showing ${category === "all" ? "all products" : category} category`
    );
  };

  const handleViewProduct = (product) => {
    if (!isUserExist) {
      showAlert(
        "failure",
        "Please sign up or login to view product details.",
        "Authentication Required"
      );
      navigate("/signup");
      return;
    }
    // Navigate to product detail page where user can add to cart
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    if (!isUserExist) {
      showAlert(
        "failure",
        "Please sign up or login to add items to cart.",
        "Authentication Required"
      );
      navigate("/signup");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      if (data.success) {
        showAlert(
          "success",
          `${product.title} added to cart successfully!`,
          "Cart Updated"
        );
        // Refresh user data to update cart count
        window.location.reload();
      }
    } catch (err) {
      showAlert(
        "failure",
        err.message || "Failed to add item to cart. Please try again.",
        "Cart Error"
      );
    }
  };

  // Format price to always show 2 decimal places
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className={`fa-brands fa-opencart ${styles.brandIcon}`}></i>{" "}
          ShopEasy
        </h1>
        <p className={styles.subtitle}>
          {isAuthenticated
            ? `Welcome back, ${user?.name}!`
            : "Discover amazing products"}
        </p>

        {/* User Auth Section */}
        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <input
            type="text"
            name="search"
            placeholder="Search for products, categories..."
            className={styles.searchInput}
            defaultValue={searchQuery}
          />
          <button type="submit" className={styles.searchButton}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        {/* Categories Filter */}
        <div className={styles.categories}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryBtn} ${
                selectedCategory === category ? styles.active : ""
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category === "all" ? "All Products" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>
          {selectedCategory === "all"
            ? searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Featured Products"
            : `${
                selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)
              }`}
        </h2>

        {/* Products Grid */}
        {products.length > 0 && (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div
                key={product._id}
                className={styles.productCard}
                onClick={() => handleViewProduct(product)}
              >
                <div className={styles.imageContainer}>
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    className={styles.productImage}
                  />
                  {product.stock < 10 && product.stock > 0 && (
                    <div className={styles.lowStock}>Low Stock</div>
                  )}
                  {product.stock === 0 && (
                    <div className={styles.outOfStock}>Out of Stock</div>
                  )}
                  {/* Quick view indicator */}
                  <div className={styles.quickView}>👁️ Quick View</div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productCategory}>{product.category}</p>
                  <p className={styles.productDescription}>
                    {product.description?.length > 100
                      ? `${product.description.substring(0, 100)}...`
                      : product.description}
                  </p>
                  {product.features && product.features.length > 0 && (
                    <div className={styles.features}>
                      {product.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className={styles.featureTag}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>
                      {formatPrice(product.price)}
                    </span>
                    <div className={styles.rating}>
                      ⭐ {product.rating?.rate || "N/A"}
                      <span className={styles.ratingCount}>
                        ({product.rating?.count || 0})
                      </span>
                    </div>
                  </div>
                  <div className={styles.stockInfo}>
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </div>
                  {/* Add to cart button visible all the time */}
                  {/* {isUserExist && (
                    <button
                      className={styles.addToCartBtn}
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      🛒 Add to Cart
                    </button>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading States */}
        {loading && (
          <div className={styles.loading}>⏳ Loading products ...</div>
        )}

        {loadingMore && (
          <div className={styles.loadingMore}>⏳ Loading ...</div>
        )}

        {/* No Results - Show when no products, not loading, and no error */}
        {!loading && !loadingMore && products.length === 0 && !error && (
          <div className={styles.noResults}>
            No products found in our database. Try a different search or
            category!
          </div>
        )}
        {/* Observer target for infinite scroll - only show if we have more to load */}
        {hasMore && !loading && !loadingMore && (
          <div ref={observerTarget} className={styles.observerTarget}></div>
        )}
      </div>
    </div>
  );
}

export default Home;
