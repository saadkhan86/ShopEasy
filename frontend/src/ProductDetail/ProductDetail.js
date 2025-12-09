import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import styles from "./ProductDetail.module.css";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/products/${productId}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        fetchRelatedProducts(data.data.category);
      } else {
        throw new Error(data.message || "Failed to fetch product");
      }
    } catch (err) {
      showAlert("failure", err.message, "profile error");
      // setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?category=${category}&limit=4`
      );
      const data = await response.json();

      if (data.success) {
        // Filter out the current product
        const filtered = data.data.filter((p) => p._id !== productId);
        setRelatedProducts(filtered.slice(0, 3));
      }
    } catch (err) {
      showAlert("failure", err.message, "product error");
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/cart/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      if (data.success) {
        showAlert("success", `✅ Added ${quantity} ${product.title} to cart!`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert("Please login to purchase items");
      navigate("/login");
      return;
    }
    // Implement buy now logic
    alert(`Proceeding to checkout with ${quantity} ${product.title}`);
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className={styles.star}>
          ⭐
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className={styles.star}>
          ⭐
        </span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className={styles.starEmpty}>
          ☆
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <i
        className={`fa-solid fa-arrow-left ${styles.backArrow}`}
        onClick={() => navigate(-1)}
      ></i>
      <div className={styles.productDetail}>
        {/* Product Images */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img
              src={product.image}
              alt={product.title}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x600?text=No+Image";
              }}
            />
          </div>
          {product.images && product.images.length > 0 && (
            <div className={styles.imageThumbnails}>
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${
                    selectedImage === index ? styles.active : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className={styles.infoSection}>
          <h1 className={styles.productTitle}>{product.title}</h1>

          <div className={styles.ratingSection}>
            <div className={styles.stars}>
              {renderStars(product.rating?.rate || 0)}
            </div>
            <span className={styles.ratingText}>
              {product.rating?.rate || "N/A"} ({product.rating?.count || 0}{" "}
              reviews)
            </span>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.currentPrice}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.discount && (
              <span className={styles.discountTag}>
                -{product.discount}% OFF
              </span>
            )}
          </div>

          <div className={styles.stockSection}>
            {product.stock > 0 ? (
              <span className={styles.inStock}>
                ✅ In Stock ({product.stock} available)
              </span>
            ) : (
              <span className={styles.outOfStock}>❌ Out of Stock</span>
            )}
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className={styles.features}>
              <h3>Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity and Action Buttons */}
          <div className={styles.actionSection}>
            <div className={styles.quantitySelector}>
              <label>Quantity:</label>
              <div className={styles.quantityControls}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                🛒 Add to Cart
              </button>
              <button
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>

          {/* Product Specifications */}
          <div className={styles.specifications}>
            <h3>Specifications</h3>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Category:</span>
                <span className={styles.specValue}>{product.category}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Brand:</span>
                <span className={styles.specValue}>
                  {product.brand || "Generic"}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>SKU:</span>
                <span className={styles.specValue}>{product.sku || "N/A"}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Weight:</span>
                <span className={styles.specValue}>
                  {product.weight || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
