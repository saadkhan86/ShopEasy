const API_BASE_URL = "http://localhost:5000/api";

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    // console.error("API call error:", error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: (userData) =>
    apiCall("/auth/signup", { method: "POST", body: userData }),
  login: (credentials) =>
    apiCall("/auth/login", { method: "POST", body: credentials }),
  getProfile: () => apiCall("/auth/profile"),
};

// Products API
export const productsAPI = {
  getProducts: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return apiCall(`/products?${params}`);
  },
  getProduct: (id) => apiCall(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => apiCall("/cart"),
  addToCart: (productId, quantity = 1) =>
    apiCall("/cart", { method: "POST", body: { productId, quantity } }),
  updateCart: (productId, quantity) =>
    apiCall(`/cart/${productId}`, { method: "PUT", body: { quantity } }),
  removeFromCart: (productId) =>
    apiCall(`/cart/${productId}`, { method: "DELETE" }),
  clearCart: () => apiCall("/cart", { method: "DELETE" }),
};
