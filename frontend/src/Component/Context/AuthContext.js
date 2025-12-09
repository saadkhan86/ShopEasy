// AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Add token state
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedAdminToken = localStorage.getItem("adminToken");

      // Priority: adminToken > token
      let finalToken = storedAdminToken || storedToken;
      let finalUser = storedUser;

      if (finalToken && finalUser) {
        try {
          setUser(JSON.parse(finalUser));
          setToken(finalToken);
        } catch (error) {
          console.error("Error parsing user data:", error);
          clearAuthData();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for storage changes (useful for multiple tabs)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "adminToken" || e.key === "user") {
        initializeAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login function - handles both regular and admin users
  const login = useCallback((userData, authToken, isAdmin = false) => {
    if (isAdmin) {
      localStorage.setItem("adminToken", authToken);
      // Clear regular token if exists
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", authToken);
      // Clear admin token if exists
      localStorage.removeItem("adminToken");
    }

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  }, []);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    // Optional: Clear any other user-specific data
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
  }, [clearAuthData]);

  // Update user data (for profile updates)
  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  }, []);

  // Update token (for token refresh scenarios)
  const updateToken = useCallback((newToken, isAdmin = false) => {
    if (isAdmin) {
      localStorage.setItem("adminToken", newToken);
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", newToken);
      localStorage.removeItem("adminToken");
    }
    setToken(newToken);
  }, []);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return (
      user?.isAdmin === true || localStorage.getItem("adminToken") !== null
    );
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return !!(user && token);
  }, [user, token]);

  // Get current auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${token}`,
      ...(isAdmin ? { "X-Admin-Access": "true" } : {}),
    };
  }, [token, isAdmin]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // State
      user,
      token,
      loading,

      // Computed values
      isAuthenticated,
      isAdmin,

      // Functions
      login,
      logout,
      updateUser,
      updateToken,
      getAuthHeaders,
      clearAuthData,

      // Helpers
      hasToken: !!token,
      userId: user?._id,
      userName: user?.name,
      userEmail: user?.email,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      updateUser,
      updateToken,
      getAuthHeaders,
      clearAuthData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Optional: Create a hook for API calls with auth
export const useAuthFetch = () => {
  const { getAuthHeaders, token } = useAuth();

  const authFetch = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      return response;
    },
    [getAuthHeaders, token]
  );

  return authFetch;
};

// Optional: Higher Order Component for protected routes
export const withAuth = (Component) => {
  return function WithAuthComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show access denied
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Please login to access this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
